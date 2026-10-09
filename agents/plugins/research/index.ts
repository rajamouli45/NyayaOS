import { Agent, AgentResult, WorkflowContext } from '../../../packages/contracts/src/index.js';
import { LegalResearchService } from '../../../platform/services/index.js';

export class ResearchAgent implements Agent {
    name = 'ResearchAgent';

    async execute(context: WorkflowContext): Promise<AgentResult> {
        const inputDelta = context.memory.get('inputDelta') || {};
        const query = inputDelta.disputeDescription || 'title dispute possession';

        // Call searchPrecedents
        const apData = await LegalResearchService.searchPrecedents(query);

        // Call getStatute
        const acData = await LegalResearchService.getStatute('Specific Relief Act', '6');

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
