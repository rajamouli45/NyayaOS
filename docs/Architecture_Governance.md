# Architecture Terminology Governance

This document establishes the official language governance to prevent leaking internal terminology to user-facing dashboards.

## 🚫 Terminology Boundaries

1. **Citizen Portal (UI Space)**:
   * **NEVER show**: `Judicial Kernel`, `Judicial Memory Bus`, `Event Store`, `Explainability Engine`, `Identity MCP`, or code-based agent variables.
   * **ALWAYS use user UI labels**: `Workflow Status`, `Live Logs / Events Feed`, `Explainability Summary`, `Identity Check`, `Document Validation`, `Registry Check`, `Precedent Research`.

2. **Judge Dashboard (Review Console)**:
   * **NEVER show**: `Event Store`, `IdentityAgent`, or raw json db logs.
   * **ALWAYS use UI & Architectural Terms**: `Judicial Memory Bus` (for the Unified Storage Bus they access), `Explainability Summary` (for explainability auditing), and standard status badges.

3. **Report Generation briefs**:
   * **NEVER expose**: Internal routes or temporary indices.
   * **ALWAYS structure**: Premium double-line tables with authorized names.

---

## 🔒 Language Freeze & Sprint Governance

The architecture and naming spec is finalized under NyayaOS 1.0. No further modifications to component names are allowed.
