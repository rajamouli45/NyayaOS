# NyayaOS Workflow Specification

NyayaOS executes judicial cases by mapping them to declarative workflow definitions rather than hardcoding steps.

## Case: Property Dispute Workflow

```yaml
id: property-dispute-v1
version: 1.0.0
name: Property Dispute
steps:
  - id: step-identity
    agent: IdentityAgent
    mcp: mcp/identity-server
    required: true

  - id: step-documents
    agent: DocumentAgent
    mcp: mcp/document-server
    required: true

  - id: step-registry
    agent: RegistryAgent
    mcp: mcp/registry-server
    required: true

  - id: step-research
    agent: ResearchAgent
    mcp: mcp/research-server
    required: false

  - id: step-judge
    agent: JudgeAgent
    mcp: null
    required: true
```
