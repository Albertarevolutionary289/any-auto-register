from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional
from core.db import TaskLog, engine
import time, json, asyncio

router = APIRouter(prefix="/tasks", tags=["tasks"])

# 内存任务状态
_tasks: dict = {}


class RegisterTaskRequest(BaseModel):
    platform: str
    email: Optional[str] = None
    password: Optional[str] = None
    count: int = 1
    concurrency: int = 1
    proxy: Optional[str] = None
    executor_type: str = "protocol"
    captcha_solver: str = "yescaptcha"
    extra: dict = {}


def _log(task_id: str, msg: str):
    """向任务追加一条日志"""
    ts = time.strftime("%H:%M:%S")
    entry = f"[{ts}] {msg}"
    if task_id in _tasks:
        _tasks[task_id].setdefault("logs", []).append(entry)
    print(entry)


def _auto_upload_cpa(task_id: str, account):
    """注册成功后自动上传 CPA（仅 chatgpt 平台，且已配置时）"""
    if getattr(account, "platform", "") != "chatgpt":
        return
    try:
        from core.config_store import config_store
        cpa_url = config_store.get("cpa_api_url", "")
        if cpa_url:
            from platforms.chatgpt.cpa_upload import generate_token_json, upload_to_cpa

            class _A: pass
            a = _A()
            a.email = account.email
            extra = account.extra or {}
            a.access_token = extra.get("access_token") or account.token
            a.refresh_token = extra.get("refresh_token", "")
            a.id_token = extra.get("id_token", "")

            token_data = generate_token_json(a)
            ok, msg = upload_to_cpa(token_data)
            _log(task_id, f"  [CPA] {'✓ ' + msg if ok else '✗ ' + msg}")
    except Exception as e:
        _log(task_id, f"  [CPA] 自动上传异常: {e}")


def _run_register(task_id: str, req: RegisterTaskRequest):
    from core.registry import get
    from core.base_platform import RegisterConfig
    from core.db import save_account
    from core.base_mailbox import create_mailbox

    _tasks[task_id]["status"] = "running"
    success = 0
    errors = []

    try:
        PlatformCls = get(req.platform)
        config = RegisterConfig(
            executor_type=req.executor_type,
            captcha_solver=req.captcha_solver,
            proxy=req.proxy,
            extra=req.extra,
        )
        mailbox = create_mailbox(
            provider=req.extra.get("mail_provider", "laoudo"),
            extra=req.extra,
            proxy=req.proxy,
        )
        def _do_one(i: int):
            from core.proxy_pool import proxy_pool
            # 若未指定代理，从代理池取
            _proxy = req.proxy
            if not _proxy:
                _proxy = proxy_pool.get_next()
            _config = RegisterConfig(
                executor_type=req.executor_type,
                captcha_solver=req.captcha_solver,
                proxy=_proxy,
                extra=req.extra,
            )
            # 每个线程独立创建 platform 实例（避免共享状态）
            _mailbox = mailbox.__class__(**mailbox.__dict__) if req.concurrency > 1 else mailbox
            _platform = PlatformCls(config=_config, mailbox=_mailbox)
            _platform._log_fn = lambda msg: _log(task_id, msg)
            try:
                _tasks[task_id]["progress"] = f"{i+1}/{req.count}"
                _log(task_id, f"开始注册第 {i+1}/{req.count} 个账号")
                if _proxy: _log(task_id, f"使用代理: {_proxy}")
                account = _platform.register(
                    email=req.email or None,
                    password=req.password,
                )
                save_account(account)
                if _proxy: proxy_pool.report_success(_proxy)
                _log(task_id, f"✓ 注册成功: {account.email}")
                _auto_upload_cpa(task_id, account)
                # 若有 cashier_url，打印并记录到任务结果
                cashier_url = (account.extra or {}).get("cashier_url", "")
                if cashier_url:
                    _log(task_id, f"  [升级链接] {cashier_url}")
                    _tasks[task_id].setdefault("cashier_urls", []).append(cashier_url)
                return True
            except Exception as e:
                if _proxy: proxy_pool.report_fail(_proxy)
                _log(task_id, f"✗ 注册失败: {e}")
                return str(e)

        from concurrent.futures import ThreadPoolExecutor, as_completed
        max_workers = min(req.concurrency, req.count, 5)
        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            futures = [pool.submit(_do_one, i) for i in range(req.count)]
            for f in as_completed(futures):
                result = f.result()
                if result is True:
                    success += 1
                else:
                    errors.append(result)
    except Exception as e:
        _log(task_id, f"致命错误: {e}")
        _tasks[task_id]["status"] = "failed"
        _tasks[task_id]["error"] = str(e)
        return

    _tasks[task_id]["status"] = "done"
    _tasks[task_id]["success"] = success
    _tasks[task_id]["errors"] = errors
    _log(task_id, f"完成: 成功 {success} 个, 失败 {len(errors)} 个")


@router.post("/register")
def create_register_task(
    req: RegisterTaskRequest,
    background_tasks: BackgroundTasks,
):
    task_id = f"task_{int(time.time()*1000)}"
    _tasks[task_id] = {"id": task_id, "status": "pending",
                       "progress": f"0/{req.count}", "logs": []}
    background_tasks.add_task(_run_register, task_id, req)
    return {"task_id": task_id}


@router.get("/{task_id}/logs/stream")
async def stream_logs(task_id: str, since: int = 0):
    """SSE 实时日志流"""
    if task_id not in _tasks:
        raise HTTPException(404, "任务不存在")

    async def event_generator():
        sent = since
        while True:
            logs = _tasks.get(task_id, {}).get("logs", [])
            while sent < len(logs):
                yield f"data: {json.dumps({'line': logs[sent]})}\n\n"
                sent += 1
            status = _tasks.get(task_id, {}).get("status", "")
            if status in ("done", "failed"):
                yield f"data: {json.dumps({'done': True, 'status': status})}\n\n"
                break
            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/logs")
def get_logs(platform: str = None, page: int = 1, page_size: int = 50):
    with Session(engine) as s:
        q = select(TaskLog)
        if platform:
            q = q.where(TaskLog.platform == platform)
        q = q.order_by(TaskLog.id.desc())
        total = len(s.exec(q).all())
        items = s.exec(q.offset((page - 1) * page_size).limit(page_size)).all()
    return {"total": total, "items": items}


@router.get("/{task_id}")
def get_task(task_id: str):
    if task_id not in _tasks:
        raise HTTPException(404, "任务不存在")
    return _tasks[task_id]


@router.get("")
def list_tasks():
    return list(_tasks.values())
