# NyayaOS Workflow Definitions

This document catalogs the judicial workflow recipes executed by the Judicial Kernel. Each dispute scenario maps to an event sequence as data configurations.

## Workflow Recipes

### 1. Property Dispute Recipe (`property-dispute.yaml`)
```yaml
id: property-dispute
name: Property Dispute Verification
version: 1.0.0
steps:
  - id: step-identity
    agentName: IdentityAgent
    serviceName: Identity Service
    mcpName: Identity MCP
  - id: step-document
    agentName: DocumentAgent
    serviceName: Document Service
    mcpName: Document MCP
  - id: step-registry
    agentName: RegistryAgent
    serviceName: Registry Service
    mcpName: Registry MCP
  - id: step-research
    agentName: ResearchAgent
    serviceName: Research Service
    mcpName: Legal Research MCP
```

### 2. Cheque Bounce Recipe (`cheque-bounce.yaml`)
```yaml
id: cheque-bounce
name: Cheque Bounce Financial Verification
version: 1.0.0
steps:
  - id: step-identity
    agentName: IdentityAgent
    serviceName: Identity Service
    mcpName: Identity MCP
  - id: step-document
    agentName: DocumentAgent
    serviceName: Document Service
    mcpName: Document MCP
  - id: step-registry
    agentName: RegistryAgent
    serviceName: Registry Service
    mcpName: Registry MCP
  - id: step-research
    agentName: ResearchAgent
    serviceName: Research Service
    mcpName: Legal Research MCP
```

### 3. Consumer Dispute Recipe (`consumer-dispute.yaml`)
```yaml
id: consumer-dispute
name: Consumer Dispute Verification
version: 1.0.0
steps:
  - id: step-identity
    agentName: IdentityAgent
    serviceName: Identity Service
    mcpName: Identity MCP
  - id: step-document
    agentName: DocumentAgent
    serviceName: Document Service
    mcpName: Document MCP
  - id: step-registry
    agentName: RegistryAgent
    serviceName: Registry Service
    mcpName: Registry MCP
  - id: step-research
    agentName: ResearchAgent
    serviceName: Research Service
    mcpName: Legal Research MCP
```
