export class StepExecutor {
    async executeStep(agent, context) {
        try {
            return await agent.execute(context);
        }
        catch (err) {
            return {
                success: false,
                confidence: 0,
                explanation: err.message || String(err)
            };
        }
    }
}
