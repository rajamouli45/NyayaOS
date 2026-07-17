# NyayaOS Architecture Design

This document details the target architecture separating platform capabilities from application specific dashboard interfaces.

## Conceptual Overview

NyayaOS functions as an Agentic Operating System, offering:
1. **Platform Kernel Space**: Planner engine, Workflow state machine, Agent Registry routing, Shared memory logs.
2. **User Application Space**: Dashboards for Citizen portals, Lawyer workspaces, Registry clerk pipelines.

```
                         +-----------------------------+
                         |      Justice Application    |
                         |                             |
                         |  [ Citizen / Judge Portals] |
                         +--------------+--------------+
                                        | (IPC / API)
                         +--------------v--------------+
                         |       NyayaOS Platform      |
                         |                             |
                         |   +-----------------------+ |
                         |   |    Workflow Engine    | |
                         |   +-----------+-----------+ |
                         |               |             |
                         |   +-----------v-----------+ |
                         |   |     Agent Registry    | |
                         |   +-----------+-----------+ |
                         |               |             |
                         |   +-----------v-----------+ |
                         |   |      Shared Memory    | |
                         |   +-----------------------+ |
                         +--------------+--------------+
                                        | (MCP protocol)
                         +--------------v--------------+
                         |       NitroStack MCPs       |
                         |                             |
                         |   [Identity / Documents]    |
                         +-----------------------------+
```
