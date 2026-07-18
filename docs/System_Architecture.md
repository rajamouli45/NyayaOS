# NyayaOS System Architecture

This document maps the hierarchical flow of control and data streaming within the NyayaOS platform runtime.

## Component Stack Flow

```text
       ┌────────────────────────────────────────────────────────┐
       │                       NyayaOS                          │
       │                 (Platform Layer)                       │
       └────────────────────────┬───────────────────────────────┘
                                │
                                ▼
       ┌────────────────────────────────────────────────────────┐
       │                   Judicial Kernel                      │
       │                 (Kernel Space Core)                    │
       └────────────────────────┬───────────────────────────────┘
                                │
                                ▼
       ┌────────────────────────────────────────────────────────┐
       │                   Workflow Planner                     │
       │                   (Planning Agent)                     │
       └────────────────────────┬───────────────────────────────┘
                                │
                                ▼
       ┌────────────────────────────────────────────────────────┐
       │              Workflow Execution Engine                 │
       │              (Step Executor Runtime)                   │
       └────────────────────────┬───────────────────────────────┘
                                │
                                ▼
       ┌────────────────────────────────────────────────────────┐
       │               Specialized MCP Services                 │
       │ (Identity MCP, Document MCP, Registry MCP, Legal Research MCP) │
       └────────────────────────┬───────────────────────────────┘
                                │
                                ▼
       ┌────────────────────────────────────────────────────────┐
       │                 Judicial Memory Bus                    │
       │              (Shared Event / Log Bus)                  │
       └────────────────────────┬───────────────────────────────┘
                                │
                                ▼
       ┌────────────────────────────────────────────────────────┐
       │                  Explainability Engine                 │
       │                 (Audit & Trace Logger)                 │
       └────────────────────────┬───────────────────────────────┘
                                │
                                ▼
       ┌────────────────────────────────────────────────────────┐
       │                 User Facing Portals                    │
       │    (Citizen Portal, Judge Dashboard, Control Center)   │
       └────────────────────────────────────────────────────────┘
```
