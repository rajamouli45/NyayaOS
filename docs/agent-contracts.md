# Agent Contracts

This document defines interfaces, inputs, results, and constraints for NyayaOS agents.

## Schema Types

```typescript
export interface AgentResult {
  agentName: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  data: any;
  error?: string;
}
```

## Agent Contract Summary

| Agent | Input | Output | Allowed MCPs | Constraints |
|---|---|---|---|---|
| **Identity** | Citizen Name, DOB, National ID | Unified Profile ID, Verification Status | `mcp/identity-server` | Cannot modify database directly |
| **Document** | Case ID, File Upload URLs | OCR text, Meta payload, Doc type | `mcp/document-server` | Reads uploaded files only |
| **Registry** | Verification profile, Case meta | File Stamp ID, Court Assignment | `mcp/registry-server` | Executes final records stamps |
| **Research** | Legal Query, Precedent reference | Context Snippets, Precedent citation | `mcp/research-server` | Integrates with Embeddings RAG |
