# NyayaOS (Judicial Agentic Operating System)

NyayaOS is an **Agentic Operating System Kernel** designed to model, orchestrate, and explain multi-agent workflows in the justice ecosystem. By connecting autonomous agent plugins with standard judicial procedures and Model Context Protocol (MCP) data servers, NyayaOS helps automate routine checks, draft legal reports, and optimize dispute resolutions.

---

## 🏛️ System Architecture Schema

NyayaOS separates its layers using clean contracts, an event bus architecture, and standard stdio-based MCP servers:

```
                  +----------------------------------+
                  |      Citizen Portal UI Front     |
                  +-----------------+----------------+
                                    | Rest API & SSE Stream
                                    v
                  +-----------------+----------------+
                  |  Express Server (Port 3001)      |
                  +-----------------+----------------+
                                    | Starts Workflow Execution
                                    v
                  +-----------------+----------------+
                  |  Judicial Kernel                 |  <--- Logs timelines to explainability
                  +--------+---------------+---------+
                           v
            +--------------+----+     +----+-------------+
            | Property Dispute  |     | Agent Registry   |
            | Cheque Bounce     |     | (Identity, Doc,  |
            | Consumer Complaint|     |  Registry, Legal)|
            +-------------------+     +----+-------------+
                                           | MCP Client Interfaces
                                           v
                                      +----+-------------+
                                      | platform/        |
                                      | mcp-manager      |
                                      +----+-------------+
                                           | Spawns & connects stdio
                                           +------------+------------+------------+
                                           |            |            |            |
                                           v            v            v            v
                                      [Identity]    [Document]   [Registry]   [Research]
                                      MCP Server    MCP Server   MCP Server   MCP Server
```

---

## ✨ Features

- **Judicial Kernel**: A runtime core orchestrating multi-agent workflow recipes.
- **Agent Registry**: Central plugins directory for Identity, Document verification, Registry matching, and Research.
- **Judicial Memory Bus** (Event Store): Shared storage that passes verified outputs and logs timeline event streams.
- **Explainability Engine**: Generates printable timeline logs and consolidated report outputs.
- **SSE Stream**: Server-Sent Events stream live status directly to the Citizen filing dashboard.
- **Operational Health Endpoint**: Comprehensive `/health` API reporting server, database, and MCP status.

---

## 📦 Directory Structure

```
├── apps/
│   ├── citizen-portal/       # Single-page interface for users to file cases and watch SSE lines
│   └── judge-dashboard/      # Judicial panel listing files, metrics, and horizontal flowcharts
├── docs/                     # Comprehensive documentation files
│   ├── INSTALLATION_GUIDE.md # Detailed prerequisites and running guide
│   ├── API_DOCUMENTATION.md  # Detailed REST documentation specifications
│   ├── DEMO_GUIDE.md         # Explanations of 5 demo simulation profiles
│   └── PITCH_DECK.md         # Markdown slides for hackathon pitch deck
├── packages/
│   ├── api/                  # Express REST backend server & SSE stream endpoint
│   └── contracts/            # Typescript interface contracts & data models
├── platform/
│   ├── workflow-engine/      # Workflow Engine, DAG runner, step executors
│   ├── explainability/       # Timeline logs and ASCII report generators
│   └── mcp-manager/          # Stdio client connections and server spawners
├── agents/
│   └── plugins/              # Identity, Document, Registry, Research plugins
├── mcp/                      # Modular microservice model context server providers
└── workflows/                # Declarative YAML workflow recipes
```

---

## 🚀 Setup & Launch

Ensure you have **Node.js >= 20.18.x** and **npm** installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (.env)
Copy the default file and configure custom variables:
```bash
cp .env.example .env
```
Default parameters inside `.env`:
- `PORT=3001`
- `DB_PATH=./db.json`
- `NODE_ENV=development`

### 3. Build Project Modules
```bash
npm run build
```

### 4. Boot Express Server
```bash
npm run api
```

#### Application Links:
- **Citizen Filing Portal**: [http://localhost:3001/](http://localhost:3001/)
- **Judge Review Dashboard**: [http://localhost:3001/judge/](http://localhost:3001/judge/)

---

## 🧪 E2E Simulation Profiles

NyayaOS supports 5 demo scenario profiles out-of-the-box (accessible via cards in the Citizen filing portal):

1. **Happy Path (`happy_path`)**: Runs the pipeline end-to-end. All agents succeed, a precedent is found, case is `COMPLETED`.
2. **Identity Mismatch (`identity_failure`)**: Mismatch inside Identity database, case `FAILED`.
3. **Missing Documents (`missing_documents`)**: Sale Deed missing required signatures, case `FAILED`.
4. **Wrong Jurisdiction (`wrong_jurisdiction`)**: Wrong registry boundaries, case `FAILED`.
5. **Duplicate Filing (`duplicate_filing`)**: Search detects parcel already has active disputes, case `FAILED`.

Run the automated validation suites:
```bash
# Verify 5 simulation profiles
node packages/api/src/verify_failures.js

# Verify case registry list, summaries, evidence, precedents, and report downloading
node packages/api/src/verify_judge.js
```

---

## 📂 Documentation Links

- [Installation & Setup Guide](docs/INSTALLATION_GUIDE.md)
- [REST API Specifications](docs/API_DOCUMENTATION.md)
- [Demo Walkthrough Scenarios](docs/DEMO_GUIDE.md)
- [Hackathon Presentation Slides / Pitch Deck](docs/PITCH_DECK.md)

---

## ⚖️ License
Licensed under the [MIT License](LICENSE).
