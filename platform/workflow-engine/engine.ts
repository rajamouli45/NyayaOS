import { Workflow, MemoryContext, WorkflowContext } from '../../packages/contracts/src/index.js';
import { AgentRegistry } from '../agent-registry/index.js';
import { EventBus } from '../event-bus/index.js';
import { ExplainabilityAuditor } from '../explainability/index.js';
import { StepExecutor } from './executor.js';

export class WorkflowEngine {
    private registry: AgentRegistry;
    private eventBus: EventBus;
    private auditor: ExplainabilityAuditor;
    private executor: StepExecutor;

    constructor(
        registry: AgentRegistry,
        eventBus: EventBus,
        auditor: ExplainabilityAuditor
    ) {
        this.registry = registry;
        this.eventBus = eventBus;
        this.auditor = auditor;
        this.executor = new StepExecutor();
    }

    async run(workflow: Workflow, memory: MemoryContext, input?: any): Promise<void> {
        const startTime = Date.now();

        // Generate unique execution ID: e.g. WF-20260717-00001
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randStr = String(Math.floor(10000 + Math.random() * 90000));
        const executionId = `WF-${dateStr}-${randStr}`;

        // Initialize Workflow Context
        const context: WorkflowContext = {
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

        for (const step of workflow.steps) {
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
            } else {
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
            }
        }

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
