import { MCPManager } from '../../../platform/mcp-manager/index.js';
export class DocumentAgent {
    name = 'DocumentAgent';
    async execute(context) {
        const identityState = context.memory.get('identity');
        if (!identityState || !identityState.verified) {
            return {
                success: false,
                confidence: 0.8,
                explanation: 'Failed: Citizen identity has not been verified.'
            };
        }
        const client = MCPManager.getInstance().getClient('document');
        const inputDelta = context.memory.get('inputDelta') || {};
        if (inputDelta.demoProfile === 'missing_documents') {
            throw new Error("Validation Error: Mandatory Land sale deed document is missing or corrupted from the submission pack.");
        }
        const fileName = inputDelta.fileName || 'LandSaleDeed_RajeshKumar.pdf';
        const contentBase64 = inputDelta.contentBase64 || 'JVBERi0xLjQKJcFSnaHlhb3Mta2VybmVsLW12cC1kZWVkLWJhc2U2NC10ZXN0Cg==';
        const documentType = inputDelta.documentType || 'Deed';
        // Call uploadDocument for deed
        const uploadRes = await client.callTool({
            name: 'uploadDocument',
            arguments: {
                fileName,
                contentBase64
            }
        });
        // @ts-ignore
        const upData = uploadRes.content?.[0] ? JSON.parse(uploadRes.content[0].text || '{}') : {};
        // Call parsePdf
        const parseRes = await client.callTool({
            name: 'parsePdf',
            arguments: { fileName }
        });
        // @ts-ignore
        const prsData = parseRes.content?.[0] ? JSON.parse(parseRes.content[0].text || '{}') : {};
        // Call checkRequired
        const checkRes = await client.callTool({
            name: 'checkRequired',
            arguments: {
                documents: [fileName],
                requiredType: documentType
            }
        });
        // @ts-ignore
        const chkData = checkRes.content?.[0] ? JSON.parse(checkRes.content[0].text || '{}') : {};
        // Call detectMissing
        const missingRes = await client.callTool({
            name: 'detectMissing',
            arguments: {
                documents: ['LandSaleDeed_RajeshKumar.pdf'],
                requiredList: ['Deed', 'IdentityProof']
            }
        });
        // @ts-ignore
        const msgData = missingRes.content?.[0] ? JSON.parse(missingRes.content[0].text || '{}') : {};
        // Record in shared memory
        context.memory.set('documents', {
            validScans: upData.success,
            deedVerified: prsData.success,
            docType: prsData.data?.documentType || 'Unknown',
            partiesMatched: prsData.success,
            missing: msgData.data?.missing || []
        });
        return {
            success: prsData.success,
            confidence: prsData.confidence || 0.95,
            explanation: prsData.reasoning || 'Document verification pipeline done.',
            output: prsData.data || {}
        };
    }
}
