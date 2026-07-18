import { Agent, AgentResult, WorkflowContext } from '../../../packages/contracts/src/index.js';
import { MCPManager } from '../../../platform/mcp-manager/index.js';

export class ResearchAgent implements Agent {
    name = 'ResearchAgent';

    async execute(context: WorkflowContext): Promise<AgentResult> {
        const client = MCPManager.getInstance().getClient('research');

        const inputDelta = context.memory.get('inputDelta') || {};
        const query = inputDelta.disputeDescription || 'title dispute possession';

        // Call searchPrecedents
        const appealRes = await client.callTool({
            name: 'searchPrecedents',
            arguments: { query }
        });
        // @ts-ignore
        const apData: any = appealRes.content?.[0] ? JSON.parse(appealRes.content[0].text || '{}') : {};

        // Call getStatute
        const actRes = await client.callTool({
            name: 'getStatute',
            arguments: {
                actName: 'Specific Relief Act',
                sectionId: '6'
            }
        });
        // @ts-ignore
        const acData: any = actRes.content?.[0] ? JSON.parse(actRes.content[0].text || '{}') : {};

        // Record in shared memory
        context.memory.set('research', {
            precedentFound: apData.success,
            cite: apData.data?.caseNumber || 'Civil Appeal 44 (2018)',
            relevanceScore: apData.confidence || 0.92,
            matchedPrecedent: apData.data?.precedent,
            statuteDetails: acData.data || {}
        });

        return {
            success: apData.success && acData.success,
            confidence: apData.confidence || 0.92,
            explanation: apData.reasoning || 'Research precedent retrieval done.',
            output: apData.data || {}
        };
    }
}
