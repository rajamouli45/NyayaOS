# NyayaOS

NyayaOS is an **Agentic Operating System** designed to orchestrate complex agent workflows. Its first target implementation is built for the justice ecosystem.

## Repository Layout

- `apps/` — Presentation overlays (e.g. `citizen-portal`).
- `platform/` — Kernel services: Planner, Workflow Engine, Shared Memory, Agent Registry.
- `agents/` — Dynamic agent plugins (e.g. Identity, Document, Registry).
- `mcp/` — NitroStack Model Context Protocol servers.
- `packages/` — Shared libraries (database client, typings, config constants).

## Quick Start

### 1. Prerequisites
- Node.js >= 20.18
- npm >= 9 (or pnpm workspaces)

### 2. Startup
```bash
# Install dependencies
npm install # fallback resolver

# Run dev loop
npm run dev
```
