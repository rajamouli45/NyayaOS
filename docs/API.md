# NyayaOS API Documentation

This details the HTTP REST developer endpoints exposed by the NyayaOS Kernel Express Server on port `3001`.

## Endpoints List

### 1. `POST /workflow/start`
Starts a new instance of the multi-agent workflow on the Judicial Kernel.
* **Payload**:
  ```json
  {
    "caseType": "Property Dispute",
    "citizenId": "cit-9988",
    "plotId": "plot-7412A",
    "location": "Bengaluru, Karnataka",
    "disputeDescription": "Title dispute possession",
    "fileName": "LandSaleDeed_RajeshKumar.pdf",
    "documentType": "Deed",
    "demoProfile": "happy_path"
  }
  ```
* **Response**: `202 Accepted` `{ "executionId": "WF-YYYYMMDD-XXXXX" }`

### 2. `GET /health`
Returns system status.
* **Response**: `200 OK` JSON containing database connectivity and checking and registration health statuses of Identity, Document, Registry, and Research MCPs.

### 3. `GET /workflows`
Index page listing all cases loaded into the registry db.json file cache.

### 4. `GET /workflow/:id`
Returns consolidated detail logs for the given execution ID. Includes demographics data, flowchart step progress, precedent citations list, and logs.

### 5. `GET /workflow/:id/status`
Returns real-time state flags for each step processing status.

### 6. `GET /workflow/:id/live`
Server-Sent Events (SSE) connector. Streams event objects to clients in real-time as tasks progress.

### 7. `GET /workflow/:id/download`
Downloads the formatted plain text report layout containing the verdict outline.
