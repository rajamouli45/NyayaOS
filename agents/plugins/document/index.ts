import { Agent, AgentResult, WorkflowContext } from '../../../packages/contracts/src/index.js';
import { DocumentService } from '../../../platform/services/index.js';

export class DocumentAgent implements Agent {
    name = 'DocumentAgent';

    async execute(context: WorkflowContext): Promise<AgentResult> {
        const identityState = context.memory.get('identity');
        if (!identityState || !identityState.verified) {
            return {
                success: false,
                confidence: 0.8,
                explanation: 'Failed: Citizen identity has not been verified.'
            };
        }

        const inputDelta = context.memory.get('inputDelta') || {};
        if (inputDelta.demoProfile === 'missing_documents') {
            throw new Error("Validation Error: Mandatory Land sale deed document is missing or corrupted from the submission pack.");
        }

        const fileName = inputDelta.fileName || 'LandSaleDeed_RajeshKumar.pdf';
        const contentBase64 = inputDelta.contentBase64 || 'JVBERi0xLjQKJcFSnaHlhb3Mta2VybmVsLW12cC1kZWVkLWJhc2U2NC10ZXN0Cg==';
        const documentType = inputDelta.documentType || 'Deed';

        // Call uploadDocument for deed
        const upData = await DocumentService.uploadDocument(fileName, contentBase64);

        // Call parsePdf
        const prsData = await DocumentService.parsePdf(fileName);

        // Call checkRequired
        const chkData = await DocumentService.checkRequired([fileName], documentType);

        // Call detectMissing
        const msgData = await DocumentService.detectMissing(['LandSaleDeed_RajeshKumar.pdf'], ['Deed', 'IdentityProof']);

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
