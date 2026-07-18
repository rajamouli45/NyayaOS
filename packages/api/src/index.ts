import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { SharedMemory } from '../../../platform/shared-memory/index.js';
import { EventBus } from '../../../platform/event-bus/index.js';
import { ExplainabilityAuditor } from '../../../platform/explainability/index.js';
import { AgentRegistry } from '../../../platform/agent-registry/index.js';
import { WorkflowEngine } from '../../../platform/workflow-engine/index.js';
import { WorkflowLoader } from '../../../platform/workflow-engine/loader.js';
import { MCPManager } from '../../../platform/mcp-manager/index.js';
import { IdentityAgent, DocumentAgent, RegistryAgent, ResearchAgent } from '../../../agents/plugins/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve Citizen Portal from apps/citizen-portal
const publicPath = path.resolve(__dirname, '../../../apps/citizen-portal');
app.use(express.static(publicPath));

// Serve Judge Dashboard from apps/judge-dashboard
const judgePath = path.resolve(__dirname, '../../../apps/judge-dashboard');
app.use('/judge', express.static(judgePath));

// In-Memory Execution Store
interface WorkflowExecution {
    executionId: string;
    startedAt: Date;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
    uiStatus?: 'DRAFT' | 'SUBMITTED' | 'PROCESSING' | 'READY_FOR_JUDGE' | 'UNDER_REVIEW' | 'CLOSED';
    currentStep: string;
    input?: any;
    steps: {
        stepId: string;
        agentName: string;
        status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
        durationMs?: number;
        confidence?: number;
        explanation?: string;
        output?: any;
    }[];
    timelineEvents: { timestamp: Date; message: string; type: string }[];
    resultText?: string;
    sseClients: express.Response[];
}

const executions = new Map<string, WorkflowExecution>();
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../../db.json');

// File-based db persistence functions
function loadDB() {
    try {
        if (fs.existsSync(dbPath)) {
            const dataState = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            for (const item of dataState) {
                item.startedAt = new Date(item.startedAt);
                item.timelineEvents = item.timelineEvents.map((e: any) => ({
                    ...e,
                    timestamp: new Date(e.timestamp)
                }));
                item.sseClients = [];
                // Default legacy items to READY_FOR_JUDGE if complete
                if (!item.uiStatus) {
                    item.uiStatus = item.status === 'COMPLETED' ? 'READY_FOR_JUDGE' : (item.status === 'FAILED' ? 'CLOSED' : 'PROCESSING');
                }
                executions.set(item.executionId, item);
            }
            console.log(`[Database] Loaded ${executions.size} executions from db.json`);
        }
    } catch (e: any) {
        console.error('[Database] Failed to load database file:', e.message);
    }
}

function saveDB() {
    try {
        const list = Array.from(executions.values()).map(exec => {
            const { sseClients, ...rest } = exec;
            return rest;
        });
        fs.writeFileSync(dbPath, JSON.stringify(list, null, 2), 'utf8');
    } catch (e: any) {
        console.error('[Database] Failed to write database file:', e.message);
    }
}

// Load DB immediately on server boot
loadDB();

// Global MCP manager
const mcpManager = MCPManager.getInstance();

// Boot MCP manager on API start
let mcpInitialized = false;
async function bootMCP() {
    if (mcpInitialized) return;
    try {
        console.log('API: Booting MCP servers...');
        await mcpManager.initializeAll();
        await mcpManager.verifyHealthAll();
        mcpInitialized = true;
        console.log('API: MCP servers booted successfully and healthy!');
    } catch (err: any) {
        console.error('API: Failed to boot MCP servers:', err.message || err);
        throw err;
    }
}

function broadcastSSE(executionId: string, data: any) {
    const exec = executions.get(executionId);
    if (!exec) return;
    const payload = JSON.stringify(data);
    exec.sseClients.forEach(client => {
        client.write(`data: ${payload}\n\n`);
    });
}

// REST Endpoints

// Helper function to handle starting a workflow with validation and normalization
async function handleWorkflowStart(req: express.Request, res: express.Response) {
    try {
        await bootMCP();
    } catch (err: any) {
        return res.status(500).json({ error: 'Failed to initialize MCP servers: ' + err.message });
    }

    const inputData = req.body || {};

    // 1. Normalization Layer: maps flat and structured JSON inputs to same standard objects
    const normData = {
        case: {
            caseType: inputData.case?.caseType || inputData.caseType || 'Property Dispute',
            court: inputData.case?.court || 'Bengaluru District Court',
            jurisdiction: inputData.case?.jurisdiction || inputData.location || 'Bengaluru Urban',
            priority: inputData.case?.priority || (inputData.demoProfile === 'identity_failure' ? 'High' : 'Normal'),
            disputeCategory: inputData.case?.disputeCategory || 'Ownership / Boundary / Encumbrance'
        },
        parties: {
            plaintiffName: inputData.parties?.plaintiffName || inputData.citizenName || 'Rajesh Kumar',
            plaintiffId: inputData.parties?.plaintiffId || inputData.citizenId || 'cit-9988',
            plaintiffMobile: inputData.parties?.plaintiffMobile || '+91 94812 12345',
            plaintiffEmail: inputData.parties?.plaintiffEmail || 'rajesh.k@gmail.com',
            plaintiffGovtId: inputData.parties?.plaintiffGovtId || 'Aadhaar-4882-9912-1002',
            plaintiffAddress: inputData.parties?.plaintiffAddress || 'No 45, 3rd Main, Malleshwaram, Bengaluru, KA',
            defendantName: inputData.parties?.defendantName || 'Mahesh Reddy',
            defendantId: inputData.parties?.defendantId || 'cit-7541',
            defendantRelationship: inputData.parties?.defendantRelationship || 'Neighbor',
            defendantAddress: inputData.parties?.defendantAddress || 'No 46, 3rd Main, Malleshwaram, Bengaluru, KA'
        },
        property: {
            plotId: inputData.property?.plotId || inputData.plotId || 'plot-7412A',
            surveyNumber: inputData.property?.surveyNumber || inputData.surveyNumber || '142/3A',
            registrationNumber: inputData.property?.registrationNumber || inputData.registrationNumber || 'REG-2024-8849',
            village: inputData.property?.village || inputData.propertyVillage || 'Kengeri',
            district: inputData.property?.district || inputData.propertyDistrict || 'Bengaluru Urban',
            state: inputData.property?.state || inputData.propertyState || 'Karnataka',
            propertyArea: inputData.property?.propertyArea || inputData.propertyArea || '1,200 sq ft'
        },
        documents: {
            aadhaar: typeof inputData.documents?.aadhaar === 'boolean' ? inputData.documents.aadhaar : true,
            saleDeed: typeof inputData.documents?.saleDeed === 'boolean' ? inputData.documents.saleDeed : (inputData.demoProfile !== 'missing_documents'),
            taxReceipt: typeof inputData.documents?.taxReceipt === 'boolean' ? inputData.documents.taxReceipt : true,
            encumbrance: typeof inputData.documents?.encumbrance === 'boolean' ? inputData.documents.encumbrance : true,
            propertySketch: typeof inputData.documents?.propertySketch === 'boolean' ? inputData.documents.propertySketch : true
        },
        dispute: {
            summary: inputData.dispute?.summary || inputData.disputeDescription || 'title dispute possession',
            description: inputData.dispute?.description || inputData.disputeDescription || 'boundary encroachment and title issue',
            relief: inputData.dispute?.relief || 'Declaration of Title',
            notes: inputData.dispute?.notes || ''
        },
        fileName: inputData.fileName || 'LandSaleDeed_RajeshKumar.pdf',
        contentBase64: inputData.contentBase64 || 'JVBERi0xLjQKJcFSnaHlhb3Mta2VybmVsLW12cC1kZWVkLWJhc2U2NC10ZXN0Cg==',
        documentType: inputData.documentType || 'Deed',
        demoProfile: inputData.demoProfile || 'happy_path'
    };

    // 2. Validation Layer: checking required fields
    if (!normData.parties.plaintiffName || !normData.parties.plaintiffId) {
        return res.status(400).json({ error: 'Validation Error: Plaintiff (Applicant) Name and ID are required.' });
    }
    if (!normData.property.plotId || !normData.property.surveyNumber) {
        return res.status(400).json({ error: 'Validation Error: Property Plot ID and Survey Number are required.' });
    }
    if (!normData.case.court || !normData.case.caseType) {
        return res.status(400).json({ error: 'Validation Error: Court Name and Dispute Case Type are required.' });
    }

    const loader = new WorkflowLoader();

    // Select workflow recipe
    let yamlName = 'property-dispute.yaml';
    if (normData.case.caseType === 'Cheque Bounce') {
        yamlName = 'cheque-bounce.yaml';
    } else if (normData.case.caseType === 'Consumer Complaint' || normData.case.caseType === 'Consumer Dispute') {
        yamlName = 'consumer-dispute.yaml';
    }
    const yamlPath = path.resolve(__dirname, '../../../workflows/' + yamlName);

    let workflow;
    try {
        console.log(`API: Loading dispute recipe: ${yamlName}`);
        workflow = loader.load(yamlPath);
    } catch (e: any) {
        return res.status(500).json({ error: 'Failed to load workflow definition: ' + e.message });
    }

    // Generate execution ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = String(Math.floor(10000 + Math.random() * 90000));
    const executionId = `WF-${dateStr}-${randStr}`;

    // Initialize components
    const registry = new AgentRegistry();
    registry.register(new IdentityAgent());
    registry.register(new DocumentAgent());
    registry.register(new RegistryAgent());
    registry.register(new ResearchAgent());

    const eventBus = new EventBus();
    const auditor = new ExplainabilityAuditor();
    const memory = new SharedMemory();
    const engine = new WorkflowEngine(registry, eventBus, auditor);

    // Prepare execution state with 'SUBMITTED' status
    const executionState: WorkflowExecution = {
        executionId,
        startedAt: new Date(),
        status: 'RUNNING',
        uiStatus: 'SUBMITTED',
        currentStep: '',
        input: normData,
        steps: workflow.steps.map(s => ({
            stepId: s.id,
            agentName: s.agentName,
            status: 'PENDING'
        })),
        timelineEvents: [],
        sseClients: []
    };
    executions.set(executionId, executionState);
    saveDB();

    // Broadcast "Workflow Created" business event to both dashboards
    broadcastSSE(executionId, {
        type: 'WorkflowCreated',
        payload: {
            workflowId: executionId,
            caseType: normData.case.caseType,
            applicant: normData.parties.plaintiffName,
            court: normData.case.court,
            status: 'SUBMITTED',
            progress: 0
        }
    });

    // Setup Event Subscriptions to update status and broadcast to SSE
    eventBus.subscribe('WorkflowStarted', (event) => {
        executionState.uiStatus = 'PROCESSING';
        const timeStr = event.timestamp.toLocaleTimeString();
        executionState.timelineEvents.push({
            timestamp: event.timestamp,
            message: `${timeStr} Workflow Started`,
            type: 'WorkflowStarted'
        });

        broadcastSSE(executionId, {
            type: 'WorkflowStarted',
            event: 'WORKFLOW_STARTED',
            status: 'SUCCESS',
            progress: 10,
            payload: event.payload
        });
        saveDB();
    });

    eventBus.subscribe('AgentStarted', (event) => {
        executionState.currentStep = event.payload.stepId;
        const step = executionState.steps.find(s => s.stepId === event.payload.stepId);
        if (step) step.status = 'RUNNING';

        const timeStr = event.timestamp.toLocaleTimeString();
        let displayAgentName = event.payload.agentName.replace('Agent', '');
        executionState.timelineEvents.push({
            timestamp: event.timestamp,
            message: `${timeStr} Processing ${displayAgentName}...`,
            type: 'AgentStarted'
        });

        // Calculate progress percentage
        let progress = 15;
        if (event.payload.stepId === 'step-document') progress = 35;
        else if (event.payload.stepId === 'step-registry') progress = 55;
        else if (event.payload.stepId === 'step-research') progress = 75;

        // Broadcast clean business event
        const stepUpper = event.payload.stepId.replace('step-', '').toUpperCase();
        broadcastSSE(executionId, {
            type: 'AgentStarted',
            event: `${stepUpper}_STARTED`,
            status: 'PROCESSING',
            progress,
            payload: event.payload
        });
        saveDB();
    });

    eventBus.subscribe('AgentCompleted', (event) => {
        const step = executionState.steps.find(s => s.stepId === event.payload.stepId);
        if (step) {
            step.status = 'COMPLETED';
            step.output = event.payload.output;
            const decision = auditor.getRecords().find(d => d.stepId === event.payload.stepId);
            if (decision) {
                step.confidence = decision.confidence;
                step.explanation = decision.explanation;
                step.durationMs = decision.durationMs;
            }
        }

        const timeStr = event.timestamp.toLocaleTimeString();
        let displayEvent = '';
        if (event.payload.agentName === 'IdentityAgent') displayEvent = 'Identity Verified';
        else if (event.payload.agentName === 'DocumentAgent') displayEvent = 'Documents Validated';
        else if (event.payload.agentName === 'RegistryAgent') displayEvent = 'Registry Confirmed';
        else if (event.payload.agentName === 'ResearchAgent') displayEvent = 'Research Completed';
        else displayEvent = `${event.payload.agentName.replace('Agent', '')} Completed`;

        executionState.timelineEvents.push({
            timestamp: event.timestamp,
            message: `${timeStr} ${displayEvent}`,
            type: 'AgentCompleted'
        });
        broadcastSSE(executionId, { type: 'AgentCompleted', payload: event.payload });
        saveDB();
    });

    eventBus.subscribe('WorkflowCompleted', (event) => {
        executionState.status = 'COMPLETED';
        auditor.printTimeline();

        let output = '\n--- ⚖️ NYAYAOS WORKFLOW EXPLAINABILITY TIMELINE ---\n';
        auditor.getRecords().forEach((rec, idx) => {
            const icon = rec.status === 'SUCCESS' ? '✓' : '✗';
            output += `[Step ${idx + 1}] ${icon} ${rec.agentName} (ID: ${rec.stepId})\n`;
            output += `       Status:     ${rec.status}\n`;
            output += `       Duration:   ${rec.durationMs}ms\n`;
            output += `       Confidence: ${(rec.confidence * 100).toFixed(1)}%\n`;
            output += `       Reasoning:  "${rec.explanation}"\n`;
            output += `----------------------------------------------------\n`;
        });
        executionState.resultText = output;

        const timeStr = event.timestamp.toLocaleTimeString();
        executionState.timelineEvents.push({
            timestamp: event.timestamp,
            message: `${timeStr} Workflow Completed Successfully in ${event.payload.totalDurationMs}ms`,
            type: 'WorkflowCompleted'
        });
        broadcastSSE(executionId, { type: 'WorkflowCompleted', payload: event.payload, resultText: output });
        saveDB();
    });

    eventBus.subscribe('WorkflowFailed', (event) => {
        executionState.status = 'FAILED';
        const timeStr = event.timestamp.toLocaleTimeString();
        executionState.timelineEvents.push({
            timestamp: event.timestamp,
            message: `${timeStr} Workflow Failed at ${event.payload.stepId}: ${event.payload.error}`,
            type: 'WorkflowFailed'
        });
        broadcastSSE(executionId, { type: 'WorkflowFailed', payload: event.payload });
        saveDB();
    });

    // Run engine asynchronously in background
    console.log(`API: Spawning workflow execution asynchronously: ${executionId}`);
    engine.run(workflow, memory, inputData)
        .catch(err => {
            console.error(`API: Workflow run failed internally for ${executionId}:`, err.message || err);
            executionState.status = 'FAILED';
            executionState.timelineEvents.push({
                timestamp: new Date(),
                message: `Workflow Aborted: ${err.message || err}`,
                type: 'WorkflowFailed'
            });
            broadcastSSE(executionId, { type: 'WorkflowFailed', payload: { stepId: executionState.currentStep || 'step-identity', error: err.message || err } });
            saveDB();
        });

    return res.status(202).json({ executionId });
}

app.post('/workflow/start', handleWorkflowStart);
app.post('/workflows', handleWorkflowStart);

// GET /health
app.get('/health', async (req, res) => {
    let dbStatus = 'OK';
    try {
        const parentDir = path.dirname(dbPath);
        if (!fs.existsSync(parentDir)) {
            dbStatus = 'ERROR: parent directory does not exist';
        } else {
            fs.accessSync(parentDir, fs.constants.W_OK);
        }
    } catch (e: any) {
        dbStatus = 'ERROR: ' + e.message;
    }

    let mcpStatuses: Record<string, string> = {
        identity: 'DOWN',
        document: 'DOWN',
        registry: 'DOWN',
        research: 'DOWN'
    };

    if (!mcpInitialized) {
        try {
            await bootMCP();
        } catch (e: any) {
            console.error('Failed to auto-boot MCP in health check:', e.message);
        }
    }

    if (mcpInitialized) {
        try {
            mcpStatuses = await mcpManager.getHealthStatus();
        } catch (e: any) {
            console.error('Failed to retrieve MCP health status:', e.message);
        }
    }

    const uptimeSeconds = Math.floor(process.uptime());

    return res.json({
        status: 'OK',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptimeSeconds,
        database: {
            status: dbStatus,
            path: dbPath
        },
        mcpServers: mcpStatuses,
        timestamp: new Date().toISOString()
    });
});

// GET /workflows
app.get('/workflows', (req, res) => {
    const list = Array.from(executions.values()).map(exec => {
        const idOutput = exec.steps.find(s => s.stepId === 'step-identity')?.output || {};
        const citizenName = idOutput.name || exec.input?.citizenName || 'Rajesh Kumar';
        return {
            executionId: exec.executionId,
            startedAt: exec.startedAt,
            status: exec.status,
            citizenId: exec.input?.citizenId || 'cit-9988',
            citizenName: citizenName,
            caseType: exec.input?.caseType || 'Property Dispute'
        };
    });
    return res.json(list);
});

// GET /workflow/:id
app.get('/workflow/:id', (req, res) => {
    const id = req.params.id;
    const exec = executions.get(id);
    if (!exec) {
        return res.status(404).json({ error: 'Execution not found' });
    }

    // Interactive state transition: READY_FOR_JUDGE -> UNDER_REVIEW
    if (exec.uiStatus === 'READY_FOR_JUDGE') {
        exec.uiStatus = 'UNDER_REVIEW';
        saveDB();
        broadcastSSE(id, {
            type: 'WorkflowStatusChanged',
            event: 'STATUS_UPDATED',
            status: 'UNDER_REVIEW',
            progress: 100,
            payload: { workflowId: id, status: 'UNDER_REVIEW' }
        });
    }

    const idStep = exec.steps.find(s => s.stepId === 'step-identity');
    const docStep = exec.steps.find(s => s.stepId === 'step-document');
    const regStep = exec.steps.find(s => s.stepId === 'step-registry');
    const resStep = exec.steps.find(s => s.stepId === 'step-research');

    const citizenName = idStep?.output?.name || exec.input?.parties?.plaintiffName || exec.input?.citizenName || 'Rajesh Kumar';
    const citizenId = exec.input?.parties?.plaintiffId || exec.input?.citizenId || 'cit-9988';
    const plotId = exec.input?.property?.plotId || exec.input?.plotId || 'plot-7412A';
    const location = exec.input?.case?.jurisdiction || exec.input?.location || 'Bengaluru, Karnataka';
    const desc = exec.input?.dispute?.description || exec.input?.disputeDescription || 'title dispute possession';

    const filingDate = new Date(exec.startedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const hearingDate = new Date(new Date(exec.startedAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let currentStage = 'Under Review';
    if (exec.status === 'COMPLETED') currentStage = 'Verification Complete';
    else if (exec.status === 'FAILED') currentStage = 'Workflow Terminated';

    let judicialStatus = 'Processing Checks';
    if (exec.status === 'COMPLETED') judicialStatus = 'Ready for Judicial Review';
    else if (exec.status === 'FAILED') judicialStatus = 'Filing Rejected';

    const stepConfidences = exec.steps.map(s => s.confidence || (s.status === 'COMPLETED' ? 0.95 : 0));
    const avgConfidence = Math.round((stepConfidences.reduce((acc, c) => acc + c, 0) / (stepConfidences.length || 1)) * 100);

    const checkFailure = exec.steps.find(s => s.status === 'FAILED')?.explanation || 'Security constraints validation check failed.';
    const finalReason = exec.status === 'COMPLETED'
        ? 'All required documents validated. Registry confirms ownership.'
        : (exec.status === 'FAILED' ? `Workflow terminated due to security violation or mismatch: ${checkFailure}` : 'Pending validation.');

    const summaryBullets = exec.status === 'COMPLETED'
        ? [
            'No conflicting ownership records detected in national database.',
            'Property deeds and tax registration entries match current land registries.',
            'Survey coordinates are aligned with the city municipal planning board.',
            'No active mortgages, liens, or encumbrances found on the title.',
            'One relevant precedent identified (Specific Relief Act Section 6).'
        ]
        : [
            `Verification check failed: ${checkFailure}`,
            'High risk profile flagged by Judicial Kernel.',
            'Audit logs generated for clerk appeal review.'
        ];

    // Response structure supporting both the new clean nested grids and retro-compatibility
    return res.json({
        // 1. Nested judicial objects (for rich UI display)
        case: {
            caseId: exec.executionId,
            caseType: exec.input?.case?.caseType || exec.input?.caseType || 'Property Dispute',
            court: exec.input?.case?.court || 'Bengaluru District Court',
            filingDate: filingDate,
            assignedJudge: exec.input?.case?.assignedJudge || 'Hon. Justice R. Sharma',
            priority: exec.input?.case?.priority || (exec.input?.demoProfile === 'identity_failure' ? 'High' : 'Normal'),
            currentStage: currentStage,
            status: judicialStatus,
            uiStatus: exec.uiStatus || 'PROCESSING',
            hearingDate: hearingDate,
            lastUpdated: new Date(exec.startedAt).toLocaleString('en-GB')
        },
        parties: {
            plaintiffName: citizenName,
            plaintiffId: citizenId,
            defendantName: exec.input?.parties?.defendantName || 'Mahesh Reddy',
            defendantId: exec.input?.parties?.defendantId || 'cit-7541'
        },
        property: {
            plotId: plotId,
            surveyNumber: exec.input?.surveyNumber || 'SY-114/2',
            registrationNumber: exec.input?.registrationNumber || 'REG-2021-98441',
            propertyArea: exec.input?.propertyArea || '2400 sq.ft',
            propertyVillage: exec.input?.propertyVillage || 'Whitefield',
            propertyDistrict: exec.input?.propertyDistrict || 'Bengaluru Urban',
            propertyState: exec.input?.propertyState || 'Karnataka',
            currentOwner: docStep?.output?.buyerName || 'Rajesh Kumar',
            registrationDate: docStep?.output?.yearOfRegistration ? `12 Oct ${docStep.output.yearOfRegistration}` : '12 Oct 2021'
        },
        verification: {
            identity: idStep?.status === 'COMPLETED' ? 'Verified' : (idStep?.status === 'FAILED' ? 'Failed' : 'Pending'),
            documentValidation: docStep?.status === 'COMPLETED' ? 'Verified' : (docStep?.status === 'FAILED' ? 'Failed' : 'Pending'),
            registryMatch: regStep?.status === 'COMPLETED' ? 'Verified' : (regStep?.status === 'FAILED' ? 'Failed' : 'Pending'),
            encumbrance: regStep?.status === 'COMPLETED' ? 'Clear' : (regStep?.status === 'FAILED' ? 'Issues Detected' : 'Pending'),
            duplicateClaim: exec.input?.demoProfile === 'duplicate_filing' ? 'Conflict' : 'None',
            ownershipMatch: docStep?.status === 'COMPLETED' ? 'Confirmed' : (docStep?.status === 'FAILED' ? 'Failed' : 'Pending')
        },
        risk: {
            overallRisk: exec.status === 'FAILED' ? 'HIGH' : 'LOW',
            identityFraud: idStep?.status === 'FAILED' ? 'Bio-details mismatch' : 'None',
            duplicateRegistration: exec.input?.demoProfile === 'duplicate_filing' ? 'Active double claim conflict' : 'None',
            registryConflict: regStep?.status === 'FAILED' ? 'Unmatched boundary registry record' : 'None',
            evidenceGaps: docStep?.status === 'FAILED' ? 'Invalid signature or missing deed' : 'None'
        },
        recommendation: {
            status: judicialStatus,
            confidence: avgConfidence,
            risk: exec.status === 'FAILED' ? 'HIGH' : 'LOW',
            reason: finalReason,
            summaryBullets: summaryBullets
        },

        // 2. Compatibility objects (retained for verify_judge.js)
        summary: {
            executionId: exec.executionId,
            startedAt: exec.startedAt,
            status: exec.status,
            caseType: exec.input?.caseType || 'Property Dispute',
            citizenId: citizenId,
            citizenName: citizenName,
            plotId: plotId,
            location: location,
            description: desc
        },
        timeline: exec.timelineEvents,
        evidence: [
            {
                fileName: exec.input?.fileName || 'LandSaleDeed_RajeshKumar.pdf',
                verified: docStep?.status === 'COMPLETED',
                owner: docStep?.output?.buyerName || 'Rajesh Kumar',
                registration: docStep?.output?.yearOfRegistration || '2022'
            }
        ],
        precedents: [
            {
                precedentName: resStep?.output?.precedent || 'Rajamani vs. Karnataka State',
                caseNumber: resStep?.output?.caseNumber || 'Civil Appeal 44 (2018)',
                statuteDetails: resStep?.output?.statuteDetails || { section: '6', act: 'Specific Relief Act' }
            }
        ],
        metrics: {
            steps: exec.steps.map(s => ({
                stepId: s.stepId,
                agentName: s.agentName,
                status: s.status,
                confidence: s.confidence || (s.status === 'COMPLETED' ? 0.95 : 0),
                durationMs: s.durationMs || 0,
                explanation: s.explanation || ''
            }))
        },
        resultText: exec.resultText || ''
    });
});

// GET /workflow/:id/download
app.get('/workflow/:id/download', (req, res) => {
    const id = req.params.id;
    const exec = executions.get(id);
    if (!exec) {
        return res.status(404).json({ error: 'Execution not found' });
    }

    const idStep = exec.steps.find(s => s.stepId === 'step-identity');
    const docStep = exec.steps.find(s => s.stepId === 'step-document');
    const regStep = exec.steps.find(s => s.stepId === 'step-registry');
    const resStep = exec.steps.find(s => s.stepId === 'step-research');

    const citizenName = idStep?.output?.name || exec.input?.parties?.plaintiffName || exec.input?.citizenName || 'Rajesh Kumar';
    const citizenId = exec.input?.parties?.plaintiffId || exec.input?.citizenId || 'cit-9988';
    const plotId = exec.input?.property?.plotId || exec.input?.plotId || 'plot-7412A';
    const location = exec.input?.case?.jurisdiction || exec.input?.location || 'Bengaluru, Karnataka';
    const desc = exec.input?.dispute?.description || exec.input?.disputeDescription || 'title dispute possession';

    const filingDate = new Date(exec.startedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const hearingDate = new Date(new Date(exec.startedAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let currentStage = 'Under Review';
    if (exec.status === 'COMPLETED') currentStage = 'Verification Complete';
    else if (exec.status === 'FAILED') currentStage = 'Workflow Terminated';

    let judicialStatus = 'Processing Checks';
    if (exec.status === 'COMPLETED') judicialStatus = 'Ready for Judicial Review';
    else if (exec.status === 'FAILED') judicialStatus = 'Filing Rejected';

    const stepConfidences = exec.steps.map(s => s.confidence || (s.status === 'COMPLETED' ? 0.95 : 0));
    const avgConfidence = Math.round((stepConfidences.reduce((acc, c) => acc + c, 0) / (stepConfidences.length || 1)) * 100);

    const checkFailure = exec.steps.find(s => s.status === 'FAILED')?.explanation || 'Security constraints validation check failed.';
    const finalReason = exec.status === 'COMPLETED'
        ? 'All required documents validated. Registry confirms ownership.'
        : (exec.status === 'FAILED' ? `Workflow terminated due to security violation or mismatch: ${checkFailure}` : 'Pending validation.');


    let report = `======================================================\n`;
    report += `               NYAYAOS DISTRICT COURT\n`;
    report += `             JUDICIAL DECISION REPORT\n`;
    report += `======================================================\n\n`;

    report += `1. CASE SUMMARY\n`;
    report += `------------------------------------------------------\n`;
    report += `Case ID:              ${exec.executionId}\n`;
    report += `Case Type:            ${exec.input?.caseType || 'Property Ownership Dispute'}\n`;
    report += `Filing Date:          ${filingDate}\n`;
    report += `Court:                Bengaluru District Court\n`;
    report += `Assigned Judge:       Hon. Justice R. Sharma\n`;
    report += `Priority:             ${exec.input?.demoProfile === 'identity_failure' ? 'High' : 'Normal'}\n`;
    report += `Current Stage:        ${currentStage}\n`;
    report += `Court Status:         ${judicialStatus}\n`;
    report += `Hearing Date:         ${hearingDate}\n`;
    report += `Last Updated:         ${new Date(exec.startedAt).toLocaleString('en-GB')}\n\n`;

    report += `2. PARTIES INVOLVED\n`;
    report += `------------------------------------------------------\n`;
    report += `Plaintiff:            ${citizenName} (ID: ${citizenId})\n`;
    report += `Defendant:            Mahesh Reddy (ID: cit-7541)\n\n`;

    report += `3. PROPERTY DETAILS\n`;
    report += `------------------------------------------------------\n`;
    report += `Plot Identifier:      ${plotId}\n`;
    report += `Survey Number:        ${exec.input?.surveyNumber || 'SY-114/2'}\n`;
    report += `Registration Number:  ${exec.input?.registrationNumber || 'REG-2021-98441'}\n`;
    report += `Property Area:        ${exec.input?.propertyArea || '2400 sq.ft'}\n`;
    report += `Location Village:     ${exec.input?.propertyVillage || 'Whitefield'}\n`;
    report += `District:             ${exec.input?.propertyDistrict || 'Bengaluru Urban'}\n`;
    report += `State:                ${exec.input?.propertyState || 'Karnataka'}\n`;
    report += `Current Owner:        ${docStep?.output?.buyerName || 'Rajesh Kumar'}\n`;
    report += `Registration Date:    ${docStep?.output?.yearOfRegistration ? `12 Oct ${docStep.output.yearOfRegistration}` : '12 Oct 2021'}\n\n`;

    report += `4. EVIDENCE VERIFICATION STATUS\n`;
    report += `------------------------------------------------------\n`;
    const docVerified = docStep?.status === 'COMPLETED' ? 'VERIFIED ✓' : 'FAILED/PENDING ✗';
    const tagBio = idStep?.status === 'COMPLETED' ? 'VERIFIED ✓' : 'FAILED/PENDING ✗';
    const tagReg = regStep?.status === 'COMPLETED' ? 'VERIFIED ✓' : 'FAILED/PENDING ✗';
    report += `- Aadhaar Card Check:        [${tagBio}]\n`;
    report += `- Land Sale Deed Review:     [${docVerified}] File: ${exec.input?.fileName || 'LandSaleDeed_RajeshKumar.pdf'}\n`;
    report += `- Tax Receipt Validation:    [${tagReg}]\n`;
    report += `- Encumbrance Certificate:   [${tagReg}]\n`;
    report += `- Khata Certificate Check:   [${tagReg}]\n\n`;

    report += `5. VERIFICATION CHECKS RESULT\n`;
    report += `------------------------------------------------------\n`;
    report += `- Identity Verification:     ${idStep?.status === 'COMPLETED' ? 'Verified ✓' : 'Failed ✗'}\n`;
    report += `- Registry Record Match:     ${regStep?.status === 'COMPLETED' ? 'Verified ✓' : 'Failed ✗'}\n`;
    report += `- Encumbrance Validation:    ${regStep?.status === 'COMPLETED' ? 'No Issues ✓' : 'Issues Detected ✗'}\n`;
    report += `- Duplicate Claim Check:     ${exec.input?.demoProfile === 'duplicate_filing' ? 'CONFLICT DETECTED ✗' : 'None Found ✓'}\n`;
    report += `- Ownership Match:           ${docStep?.status === 'COMPLETED' ? 'Successful ✓' : 'Failed ✗'}\n\n`;

    report += `6. RISK ASSESSMENT\n`;
    report += `------------------------------------------------------\n`;
    report += `Overall Risk Rating:  ${exec.status === 'FAILED' ? 'HIGH 🚨' : 'LOW ✓'}\n`;
    report += `- Identity Mismatch:  ${idStep?.status === 'FAILED' ? 'Bio-details mismatch detected' : 'None'}\n`;
    report += `- Double Registration: ${exec.input?.demoProfile === 'duplicate_filing' ? 'Active double registration detected' : 'None'}\n`;
    report += `- Registry Boundary:  ${regStep?.status === 'FAILED' ? 'Registry coordinates boundary conflict' : 'None'}\n`;
    report += `- Evidence Gaps:      ${docStep?.status === 'FAILED' ? 'Tax/deed documents verification gap' : 'None'}\n\n`;

    report += `7. RELEVANT PRECEDENTS\n`;
    report += `------------------------------------------------------\n`;
    const precedent = resStep?.output?.precedent || 'Rajamani vs. Karnataka State';
    const caseNum = resStep?.output?.caseNumber || 'Civil Appeal 44 (2018)';
    const statute = resStep?.output?.statuteDetails || { section: '6', act: 'Specific Relief Act' };
    report += `- Case Citation:      ${precedent} | Reference: ${caseNum}\n`;
    report += `- Statutory Clause:   ${statute.act || 'Specific Relief Act'} (Section ${statute.section || '6'})\n\n`;

    report += `8. AI VERDICT RECOMMENDATION\n`;
    report += `------------------------------------------------------\n`;
    report += `Filing Recommendation:   ${judicialStatus}\n`;
    report += `Recommendation Score:    ${avgConfidence}% Confidence\n`;
    report += `Outcome Summary:\n`;
    report += `"${finalReason}"\n\n`;

    report += `9. EXPLAINABILITY LOGGING\n`;
    report += `------------------------------------------------------\n`;
    exec.steps.forEach(s => {
        if (s.explanation) {
            report += `* ${s.agentName} (${s.stepId}): "${s.explanation}"\n`;
        }
    });
    report += `\n`;

    report += `10. CASE VERIFICATION TIMELINE\n`;
    report += `------------------------------------------------------\n`;
    exec.timelineEvents.forEach(evt => {
        report += `[${new Date(evt.timestamp).toLocaleTimeString()}] ${evt.message}\n`;
    });
    report += `\n`;

    report += `Report generated by NyayaOS Explainability Engine.\n`;
    report += `System Timestamp: ${new Date().toISOString()}\n`;
    report += `======================================================\n`;

    res.setHeader('Content-disposition', `attachment; filename=NyayaOS_Report_${id}.txt`);
    res.setHeader('Content-type', 'text/plain');
    return res.send(report);
});

// GET /workflow/:id/status
app.get('/workflow/:id/status', (req, res) => {
    const id = req.params.id;
    const exec = executions.get(id);
    if (!exec) {
        return res.status(404).json({ error: 'Execution not found' });
    }
    return res.json({
        executionId: exec.executionId,
        status: exec.status,
        currentStep: exec.currentStep,
        steps: exec.steps.map(s => ({
            stepId: s.stepId,
            agentName: s.agentName,
            status: s.status,
            confidence: s.confidence,
            durationMs: s.durationMs,
            explanation: s.explanation
        }))
    });
});

// GET /workflow/:id/timeline
app.get('/workflow/:id/timeline', (req, res) => {
    const id = req.params.id;
    const exec = executions.get(id);
    if (!exec) {
        return res.status(404).json({ error: 'Execution not found' });
    }
    return res.json(exec.timelineEvents);
});

// GET /workflow/:id/result
app.get('/workflow/:id/result', (req, res) => {
    const id = req.params.id;
    const exec = executions.get(id);
    if (!exec) {
        return res.status(404).json({ error: 'Execution not found' });
    }
    return res.json({
        executionId: exec.executionId,
        status: exec.status,
        resultText: exec.resultText || ''
    });
});

// GET /workflow/:id/live (SSE endpoint)
app.get('/workflow/:id/live', (req, res) => {
    const id = req.params.id;
    const exec = executions.get(id);
    if (!exec) {
        return res.status(404).json({ error: 'Execution not found' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // Write initial connection success
    res.write(`data: ${JSON.stringify({ type: 'Connected', executionId: id })}\n\n`);

    // Replay historical timeline events
    exec.timelineEvents.forEach(evt => {
        res.write(`data: ${JSON.stringify({ type: 'Historical', payload: evt })}\n\n`);
    });

    exec.sseClients.push(res);

    req.on('close', () => {
        exec.sseClients = exec.sseClients.filter(c => c !== res);
    });
});

// Start listening
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`NyayaOS API Server running on http://localhost:${PORT}`);
});

// Clean shutdown
const cleanShutdown = async () => {
    console.log('API Server closing down...');
    server.close();
    await mcpManager.shutdownAll();
    process.exit(0);
};

process.on('SIGINT', cleanShutdown);
process.on('SIGTERM', cleanShutdown);
