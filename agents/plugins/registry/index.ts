import { Agent, AgentResult, WorkflowContext } from '../../../packages/contracts/src/index.js';
import { RegistryService } from '../../../platform/services/index.js';

export class RegistryAgent implements Agent {
    name = 'RegistryAgent';

    async execute(context: WorkflowContext): Promise<AgentResult> {
        const docState = context.memory.get('documents');
        if (!docState || !docState.deedVerified) {
            return {
                success: false,
                confidence: 0.9,
                explanation: 'Failed: Core land deeds verification is missing.'
            };
        }

        const inputDelta = context.memory.get('inputDelta') || {};
        if (inputDelta.demoProfile === 'wrong_jurisdiction') {
            throw new Error("Registry Location Mismatch: Disputed plot registry entry sits under Maharashtra State territorial administration. Suggested Court Node: Mumbai Land Tribunal.");
        }
        if (inputDelta.demoProfile === 'duplicate_filing') {
            throw new Error("Registry Check Failed: An active dispute (Ref: case-8812) has already been registered on this plot ID.");
        }

        const plotId = inputDelta.plotId || docState.plotId || 'plot-7412A';
        const location = inputDelta.location || 'Bengaluru, Karnataka';

        // Call checkJurisdiction
        const jrData = await RegistryService.checkJurisdiction(plotId, location);

        // Call checkDuplicateFiling
        const dpData = await RegistryService.checkDuplicateFiling(context.citizenId, plotId);

        // Call checkCompleteness
        const cpData = await RegistryService.checkCompleteness({
            identityVerified: true,
            documentVerified: docState.deedVerified
        });

        // Record in shared memory
        context.memory.set('registry', {
            registered: true,
            cadastralId: docState.plotId || 'plot-7412A',
            ownerRecordMatches: jrData.success,
            jurisdiction: jrData.data || {},
            duplicateChecked: dpData.success,
            caseComplete: cpData.data?.complete
        });

        return {
            success: jrData.success && cpData.data?.complete,
            confidence: jrData.confidence || 0.98,
            explanation: jrData.reasoning || 'Registry check and validation pipeline completed.',
            output: jrData.data || {}
        };
    }
}
