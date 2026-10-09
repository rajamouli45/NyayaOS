import { Agent, AgentResult, WorkflowContext } from '../../../packages/contracts/src/index.js';
import { IdentityService } from '../../../platform/services/index.js';

export class IdentityAgent implements Agent {
    name = 'IdentityAgent';

    async execute(context: WorkflowContext): Promise<AgentResult> {
        const inputDelta = context.memory.get('inputDelta') || {};
        if (inputDelta.demoProfile === 'identity_failure') {
            throw new Error("Identity Verification Mismatch: Submitted citizen ID record details do not match national bio-database record.");
        }

        // Call verifyIdentity
        const vData = await IdentityService.verifyIdentity(context.citizenId);

        if (!vData.success) {
            return {
                success: false,
                confidence: vData.confidence || 0.8,
                explanation: vData.reasoning || 'Verify identity failed.',
                output: vData.data || {}
            };
        }

        // Call validateCitizen
        const address = vData.data.address || '';
        const valData = await IdentityService.validateCitizen(context.citizenId, address);

        // Call extractProfile
        const extData = await IdentityService.extractProfile(context.citizenId);

        // Record in shared memory context
        context.memory.set('identity', {
            verified: true,
            citizenName: vData.data.name,
            address: vData.data.address,
            profileHash: '9d8f7b6c5a4d3e2f',
            validated: valData.success,
            profile: extData.data || {}
        });

        return {
            success: true,
            confidence: extData.confidence || 0.99,
            explanation: extData.reasoning || 'Successfully verified identity and extracted profile.',
            output: extData.data || {}
        };
    }
}
