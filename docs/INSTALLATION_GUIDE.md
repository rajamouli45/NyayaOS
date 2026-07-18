# NyayaOS Installation Guide

This guide describes how to install, configure, build, and run the NyayaOS platform on your local machine.

---

## 📋 Prerequisites

Before setting up NyayaOS, ensure you have the following installed:
- **Node.js**: Version `>= 20.18.x` (Recommended: Node.js v22 LTS)
- **npm** (Included with Node.js) or **pnpm** (Version `>= 8.x`)

---

## 🛠️ Step-by-Step Setup

### Step 1: Clone the Repository
Clonse the repository to your local development environment:
```bash
git clone https://github.com/[username]/NyayaOS.git
cd NyayaOS
```

### Step 2: Install Dependencies
Install all package dependencies in the workspace:
```bash
npm install
```

### Step 3: Environment Configuration
Create a local `.env` configuration file by copying the example file:
```bash
cp .env.example .env
```
Open the `.env` file and customize the variables as needed:
```env
PORT=3001
DB_PATH=./db.json
NODE_ENV=development
```

### Step 4: Build Codebase Modules
Compile all TypeScript components into targeted JavaScript outputs:
```bash
npm run build
```

---

## 🚀 Running the Platform

### Start Express API & MCP Orchestration
Boot the Express API server. This automatically starts the backend server, launches the 4 Model Context Protocol (MCP) subprocesses, runs health probes, and begins listening on the configured port (default is 3001):
```bash
npm run api
```

Once running:
- **Citizen Filing Portal**: Open [http://localhost:3001/](http://localhost:3001/) in your web browser.
- **Judge Review Dashboard**: Open [http://localhost:3001/judge/](http://localhost:3001/judge/) in your web browser.

---

## 🏥 Health Check Endpoint

Ensure the platform is healthy by calling the GET `/health` endpoint:
```bash
curl http://localhost:3001/health
```

---

## 🔍 Troubleshooting

### Port 3001 Already In Use
If you receive an `EADDRINUSE` error on port 3001, find and terminate the active process:
- **Windows (PowerShell)**:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
  ```
- **macOS / Linux**:
  ```bash
  kill -9 $(lsof -t -i:3001)
  ```

### Database Permissions Error
If the API fails to initialize because it cannot write to `./db.json`, verify that the root directory is writable by your current OS user account.
