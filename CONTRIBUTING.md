# Contributing to NyayaOS

Welcome to NyayaOS! To keep our codebase clean, please follow these team rules:

## 🌿 Branching Strategy
* Commit to `main` only for documentation fixes and verified sprint merges.
* Feature work must occur in descriptive branch folders: `feature/*` or `fix/*`.

## 🔒 Language Boundaries (Naming.md)
* **Technical Terms** (`Identity MCP`, `Judicial Kernel`) belong in the engine modules.
* **System Names** (`Identity Service`, `Workflow Planner`) belong in service interfaces.
* **User UI Labels** (`Identity Check`, `Workflow Status`) belong in citizen/judge screens.

## 🧪 Definition of Done (DoD)
Before pushing code, make sure:
1. TypeScript builds finish without warnings (`npm run build`).
2. E2E verification suites pass successfully (`node packages/api/src/verify_failures.js`).
3. Dashboard indices return valid KPIs.
4. The Naming and Style governance models are respected perfectly.
