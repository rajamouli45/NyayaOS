import { MCPManager } from '../../../platform/mcp-manager/index.js';
export class RegistryAgent {
    name = 'RegistryAgent';
    async execute(context) {
        const docState = context.memory.get('documents');
        if (!docState || !docState.deedVerified) {
            return {
                success: false,
                confidence: 0.9,
                explanation: 'Failed: Core land deeds verification is missing.'
            };
        }
        const client = MCPManager.getInstance().getClient('registry');
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
        const jurisRes = await client.callTool({
            name: 'checkJurisdiction',
            arguments: {
                plotId,
                location
            }
        });
        // @ts-ignore
        const jrData = jurisRes.content?.[0] ? JSON.parse(jurisRes.content[0].text || '{}') : {};
        // Call checkDuplicateFiling
        const dupRes = await client.callTool({
            name: 'checkDuplicateFiling',
            arguments: {
                citizenId: context.citizenId,
                plotId
            }
        });
        // @ts-ignore
        const dpData = dupRes.content?.[0] ? JSON.parse(dupRes.content[0].text || '{}') : {};
        // Call checkCompleteness
        const completeRes = await client.callTool({
            name: 'checkCompleteness',
            arguments: {
                caseData: {
                    identityVerified: true,
                    documentVerified: docState.deedVerified
                }
            }
        });
        // @ts-ignore
        const cpData = completeRes.content?.[0] ? JSON.parse(completeRes.content[0].text || '{}') : {};
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
