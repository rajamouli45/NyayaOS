import { StepExecutor } from './executor.js';
export class WorkflowEngine {
    registry;
    eventBus;
    auditor;
    executor;
    constructor(registry, eventBus, auditor) {
        this.registry = registry;
        this.eventBus = eventBus;
        this.auditor = auditor;
        this.executor = new StepExecutor();
    }
    async run(workflow, memory, input) {
        const startTime = Date.now();
        // Generate unique execution ID: e.g. WF-20260717-00001
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randStr = String(Math.floor(10000 + Math.random() * 90000));
        const executionId = `WF-${dateStr}-${randStr}`;
        // Initialize Workflow Context
        const context = {
            workflowId: workflow.id,
            caseId: input?.caseId || 'case-2901',
            citizenId: input?.citizenId || 'cit-9988',
            memory: memory,
            metadata: {
                startedAt: new Date(),
                currentStep: '',
                executionId: executionId
            }
        };
        // Cache any additional input parameters so plugins can access them dynamically
        if (input) {
            memory.set('inputDelta', input);
        }
        this.eventBus.emit({
            type: 'WorkflowStarted',
            timestamp: new Date(),
            workflowId: workflow.id,
            payload: { stepsCount: workflow.steps.length, executionId }
        });
        console.log(`\n ⚖️  NyayaOS Workflow Running: ${workflow.id} (Exec ID: ${executionId})`);
        console.log(`========================================`);
        const runStep = async (step) => {
            const agent = this.registry.get(step.agentName);
            context.metadata.currentStep = step.id;
            this.eventBus.emit({
                type: 'AgentStarted',
                timestamp: new Date(),
                workflowId: workflow.id,
                payload: { stepId: step.id, agentName: step.agentName, executionId }
            });
            console.log(`   Running step: ${step.id}...`);
            const stepStart = Date.now();
            const result = await this.executor.executeStep(agent, context);
            const stepDuration = Date.now() - stepStart;
            this.auditor.recordDecision({
                stepId: step.id,
                agentName: step.agentName,
                confidence: result.confidence,
                explanation: result.explanation,
                durationMs: stepDuration,
                status: result.success ? 'SUCCESS' : 'FAILED'
            });
            if (result.success) {
                this.eventBus.emit({
                    type: 'AgentCompleted',
                    timestamp: new Date(),
                    workflowId: workflow.id,
                    payload: { stepId: step.id, agentName: step.agentName, executionId, output: result.output }
                });
                console.log(`   ✓ Completed step: ${step.id} in ${stepDuration}ms`);
                return result;
            }
            else {
                this.eventBus.emit({
                    type: 'WorkflowFailed',
                    timestamp: new Date(),
                    workflowId: workflow.id,
                    payload: { stepId: step.id, executionId, error: result.explanation }
                });
                console.error(`   ✗ Step failed: ${step.id}`);
                if (step.required) {
                    throw new Error(`Critical workflow step ${step.id} (Agent: ${step.agentName}) failed.`);
                }
                return result;
            }
        };
        const validationSteps = workflow.steps.filter(s => s.id !== 'step-research');
        const researchStep = workflow.steps.find(s => s.id === 'step-research');
        const pipelinePromise = (async () => {
            for (const step of validationSteps) {
                await runStep(step);
            }
        })();
        const researchPromise = (async () => {
            if (researchStep) {
                await runStep(researchStep);
            }
        })();
        await Promise.all([pipelinePromise, researchPromise]);
        const totalDuration = Date.now() - startTime;
        this.eventBus.emit({
            type: 'WorkflowCompleted',
            timestamp: new Date(),
            workflowId: workflow.id,
            payload: { totalDurationMs: totalDuration, executionId }
        });
        console.log(`========================================`);
        console.log(`Workflow Completed successfully in ${(totalDuration / 1000).toFixed(2)}s\n`);
    }
}
