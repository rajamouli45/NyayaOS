# MCP Tool Contracts

Defines the expected Model Context Protocol tools and resource endpoints.

## Servers List

### 1. Identity Server (`mcp/identity-server`)
- **Tools**:
  - `verify_citizen_identity`
    - Input: `nationalId: string`, `fullName: string`
    - Returns: `{ verified: boolean, profileHash: string }`
  - `retrieve_citizen_records`
    - Input: `profileHash: string`
    - Returns: `{ records: Array<any> }`

### 2. Document Server (`mcp/document-server`)
- **Tools**:
  - `ocr_scan_pdf`
    - Input: `fileUrl: string`
  - `categorize_document`
    - Input: `extractedText: string`

### 3. Registry Server (`mcp/registry-server`)
- **Tools**:
  - `assign_case_file`
    - Input: `caseDetails: any`

### 4. Research Server (`mcp/research-server`)
- **Tools**:
  - `search_legal_context`
    - Input: `query: string`, `limit?: number`
