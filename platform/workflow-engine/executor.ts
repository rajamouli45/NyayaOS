import { Agent, AgentResult, WorkflowContext } from '../../packages/contracts/src/index.js';

export class StepExecutor {
    async executeStep(agent: Agent, context: WorkflowContext): Promise<AgentResult> {
        try {
            return await agent.execute(context);
        } catch (err: any) {
            return {
                success: false,
                confidence: 0,
                explanation: err.message || String(err)
            };
        }
    }
}
