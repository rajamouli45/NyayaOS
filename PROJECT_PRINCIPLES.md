# NyayaOS Project Principles

This outlines the core design, engineering, and execution philosophy for NyayaOS.

## 🛠 Engineering Principles
1. **Observability First**: Every event, trace log, status transition, and database payload must be visible.
2. **Event-Driven Workflows**: Core agents must process tasks using asynchronous subscription events rather than hardcoded logic.
3. **Decoupled Swarms**: Servicing modules (Identity, Documents, Registry, Research) are isolated into individual MCP servers.
4. **Configurable Recipes**: The workflow plan is structured in text files (YAML) to keep the Judicial Kernel extensible.

## 🤖 AI Principles
1. **Humans in the Loop**: AI agents only automate inspections and provide precedents; final judicial authority belongs to judges.
2. **Complete Explainability**: Every agent decision must be logged with rationales and confidence percentages.
3. **Trace Auditing**: System decisions must write explainability files verifying compliance.

## 🎭 Demo Principles
1. **90-Second Execution**: The entire Happy Path scenario must run and complete in less than 90 seconds.
2. **One-Click Reset**: The repository must provide simple setup scripts resetting the database.
3. **Offline Fallback**: Subsystems must run offline using mock databases if the network is unavailable.
