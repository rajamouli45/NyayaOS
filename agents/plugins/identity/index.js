import { MCPManager } from '../../../platform/mcp-manager/index.js';
export class IdentityAgent {
    name = 'IdentityAgent';
    async execute(context) {
        const client = MCPManager.getInstance().getClient('identity');
        const inputDelta = context.memory.get('inputDelta') || {};
        if (inputDelta.demoProfile === 'identity_failure') {
            throw new Error("Identity Verification Mismatch: Submitted citizen ID record details do not match national bio-database record.");
        }
        // Call verifyIdentity
        const verifyRes = await client.callTool({
            name: 'verifyIdentity',
            arguments: { citizenId: context.citizenId }
        });
        // @ts-ignore
        const vData = verifyRes.content?.[0] ? JSON.parse(verifyRes.content[0].text || '{}') : {};
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
        const validateRes = await client.callTool({
            name: 'validateCitizen',
            arguments: { citizenId: context.citizenId, address }
        });
        // @ts-ignore
        const valData = validateRes.content?.[0] ? JSON.parse(validateRes.content[0].text || '{}') : {};
        // Call extractProfile
        const extractRes = await client.callTool({
            name: 'extractProfile',
            arguments: { citizenId: context.citizenId }
        });
        // @ts-ignore
        const extData = extractRes.content?.[0] ? JSON.parse(extractRes.content[0].text || '{}') : {};
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
