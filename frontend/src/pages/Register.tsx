import { useState } from 'react'
import { apiFetch } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({
    platform: 'trae',
    email: '',
    password: '',
    count: 1,
    proxy: '',
    executor_type: 'protocol',
    captcha_solver: 'yescaptcha',
    laoudo_auth: '',
    laoudo_email: '',
    laoudo_account_id: '',
    yescaptcha_key: '',
    solver_url: 'http://localhost:8888',
  })
  const [task, setTask] = useState<any>(null)
  const [polling, setPolling] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    const res = await apiFetch('/tasks/register', {
      method: 'POST',
      body: JSON.stringify({
        platform: form.platform,
        email: form.email || null,
        password: form.password || null,
        count: form.count,
        proxy: form.proxy || null,
        executor_type: form.executor_type,
        captcha_solver: form.captcha_solver,
        extra: {
          laoudo_auth: form.laoudo_auth,
          laoudo_email: form.laoudo_email,
          laoudo_account_id: form.laoudo_account_id,
          yescaptcha_key: form.yescaptcha_key,
            solver_url: form.solver_url,
        },
      }),
    })
    setTask(res)
    setPolling(true)
    pollTask(res.task_id)
  }

  const pollTask = async (id: string) => {
    const interval = setInterval(async () => {
      const t = await apiFetch(`/tasks/${id}`)
      setTask(t)
      if (t.status === 'done' || t.status === 'failed') {
        clearInterval(interval)
        setPolling(false)
        // 自动打开 cashier_url（Trae Pro 升级链接）
        if (t.cashier_urls && t.cashier_urls.length > 0) {
          t.cashier_urls.forEach((url: string) => window.open(url, '_blank'))
        }
      }
    }, 2000)
  }

  const Input = ({ label, k, type = 'text', placeholder = '' }: any) => (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      <input
        type={type}
        value={(form as any)[k]}
        onChange={e => set(k, type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
      />
    </div>
  )

  const Select = ({ label, k, options }: any) => (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      <select
        value={(form as any)[k]}
        onChange={e => set(k, e.target.value)}
        className="w-full bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
      >
        {options.map(([v, l]: any) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">注册任务</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">创建账号自动注册任务</p>
      </div>

      <Card>
        <CardHeader><CardTitle>基本配置</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select label="平台" k="platform" options={[['trae','Trae.ai'],['tavily','Tavily'],['cursor','Cursor'],['kiro','Kiro']]} />
          <Select label="执行器" k="executor_type" options={[['protocol','纯协议'],['headless','无头浏览器'],['headed','有头浏览器']]} />
          <Select label="验证码" k="captcha_solver" options={[['yescaptcha','YesCaptcha'],['local_solver','本地Solver(Camoufox)'],['manual','手动']]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="批量数量" k="count" type="number" />
            <Input label="代理 (可选)" k="proxy" placeholder="http://user:pass@host:port" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>邮箱配置 (Laoudo)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="邮箱地址" k="laoudo_email" placeholder="xxx@laoudo.com" />
          <Input label="Account ID" k="laoudo_account_id" placeholder="563" />
          <Input label="JWT Token" k="laoudo_auth" placeholder="eyJ..." />
        </CardContent>
      </Card>

      {form.captcha_solver === 'yescaptcha' && (
        <Card>
          <CardHeader><CardTitle>验证码配置</CardTitle></CardHeader>
          <CardContent>
            <Input label="YesCaptcha Key" k="yescaptcha_key" />
          </CardContent>
        </Card>
      )}
      {form.captcha_solver === 'local_solver' && (
        <Card>
          <CardHeader><CardTitle>本地 Solver 配置</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input label="Solver URL" k="solver_url" />
            <p className="text-xs text-[var(--text-muted)]">启动命令: python services/turnstile_solver/start.py --headless --browser-type camoufox</p>
          </CardContent>
        </Card>
      )}

      <Button onClick={submit} disabled={polling} className="w-full">
        {polling ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />注册中...</> : <><Play className="h-4 w-4 mr-2" />开始注册</>}
      </Button>

      {task && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              任务状态
              <Badge variant={
                task.status === 'done' ? 'success' :
                task.status === 'failed' ? 'danger' : 'default'
              }>{task.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>任务 ID</span><span className="font-mono">{task.id}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>进度</span><span>{task.progress}</span>
            </div>
            {task.success != null && (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                成功 {task.success} 个
              </div>
            )}
            {task.errors?.length > 0 && (
              <div className="space-y-1">
                {task.errors.map((e: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-red-400">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs">{e}</span>
                  </div>
                ))}
              </div>
            )}
            {task.error && (
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-4 w-4" />
                <span className="text-xs">{task.error}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
