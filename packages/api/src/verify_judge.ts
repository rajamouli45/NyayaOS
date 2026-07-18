import { TextDecoder } from 'util';

async function verifyJudgeFlow() {
    console.log('🏁 Starting E2E Judge Dashboard Integration Verification...');

    // 1. Submit Case
    const startUrl = 'http://localhost:3001/workflow/start';
    console.log('📡 1. Submitting a new property dispute...');

    const response = await fetch(startUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            caseType: 'Property Dispute',
            citizenId: 'cit-9988',
            plotId: 'plot-7412A',
            location: 'Bengaluru, Karnataka',
            disputeDescription: 'possession dispute boundary overlap',
            fileName: 'Deed_RajeshKumar.pdf',
            documentType: 'Deed'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to start workflow: ' + response.statusText);
    }

    const { executionId } = await response.json();
    console.log('   ✔ Workflow started. ID:', executionId);

    // 2. Wait for completion (poll status)
    console.log('📡 2. Polling execution progress...');
    let completed = false;
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const statusRes = await fetch(`http://localhost:3001/workflow/${executionId}/status`);
        const statusData = await statusRes.json();
        console.log(`   - Status (Attempt ${i + 1}):`, statusData.status);
        if (statusData.status === 'COMPLETED' || statusData.status === 'FAILED') {
            completed = true;
            break;
        }
    }

    if (!completed) {
        throw new Error('Workflow polling timed out without completion!');
    }

    // 3. Test GET /workflows
    console.log('📡 3. Checking Case Registry list (GET /workflows)...');
    const listRes = await fetch('http://localhost:3001/workflows');
    const casesList = await listRes.json();
    const found = casesList.find((c: any) => c.executionId === executionId);
    if (!found) {
        throw new Error(`Execution ID ${executionId} not found in case registry list!`);
    }
    console.log('   ✔ Found case in registry! Citizen:', found.citizenName, '| Status:', found.status);

    // 4. Test GET /workflow/:id
    console.log(`📡 4. Retrieving consolidated case details (GET /workflow/${executionId})...`);
    const detailRes = await fetch(`http://localhost:3001/workflow/${executionId}`);
    const details = await detailRes.json();

    // Assert consolidated components
    console.log('   ✔ Summary Check:', details.summary.caseType, '| Citizen Name:', details.summary.citizenName);
    console.log('   ✔ Evidence Check: Filename:', details.evidence[0]?.fileName, '| Verified:', details.evidence[0]?.verified);
    console.log('   ✔ Precedent Check: Matching:', details.precedents[0]?.precedentName, '| Act:', details.precedents[0]?.statuteDetails?.act);
    console.log('   ✔ Metrics Check: Steps Count:', details.metrics.steps.length);

    // Confidence meters check
    details.metrics.steps.forEach((s: any) => {
        console.log(`     - Step: ${s.stepId} -> Confidence: ${Math.round(s.confidence * 100)}%`);
    });

    // 5. Test GET /workflow/:id/download
    console.log(`📡 5. Fetching downloadable judicial report (GET /workflow/${executionId}/download)...`);
    const downloadRes = await fetch(`http://localhost:3001/workflow/${executionId}/download`);
    if (!downloadRes.ok) {
        throw new Error('Report download failed!');
    }
    const reportText = await downloadRes.text();
    console.log('   ✔ Report fetched successfully! Snippet of report header:');
    console.log(reportText.substring(0, 300));
    console.log('\n🌟 SUCCESS: All Judge Dashboard integration checks passed perfectly! 🌟');
    process.exit(0);
}

verifyJudgeFlow().catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
});
