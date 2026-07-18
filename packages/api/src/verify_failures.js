async function runTargetTest(profileName, expectedStatus, errorSnippet) {
    console.log(`📡 Testing profile: "${profileName}" (Expected: ${expectedStatus})...`);
    const response = await fetch('http://localhost:3001/workflow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            caseType: 'Property Dispute',
            citizenId: 'cit-9988',
            plotId: 'plot-7412A',
            location: 'Bengaluru, Karnataka',
            disputeDescription: `Testing simulation for ${profileName}`,
            fileName: 'Deed_RajeshKumar.pdf',
            documentType: 'Deed',
            demoProfile: profileName
        })
    });
    if (!response.ok) {
        throw new Error(`Failed to start workflow for profile ${profileName}`);
    }
    const { executionId } = await response.json();
    console.log(`   ✔ Started. ID: ${executionId}`);
    let completed = false;
    let finalState = null;
    for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 800));
        const statusRes = await fetch(`http://localhost:3001/workflow/${executionId}/status`);
        finalState = await statusRes.json();
        if (finalState.status === 'COMPLETED' || finalState.status === 'FAILED') {
            completed = true;
            break;
        }
    }
    if (!completed) {
        throw new Error(`Profile ${profileName} timed out!`);
    }
    if (finalState.status !== expectedStatus) {
        throw new Error(`Profile ${profileName} status mismatch! Expected: ${expectedStatus}, Got: ${finalState.status}`);
    }
    // Retrieve timeline log details to verify error message matches
    const detailsRes = await fetch(`http://localhost:3001/workflow/${executionId}`);
    const details = await detailsRes.json();
    console.log(`   ✔ Total Timeline Events: ${details.timeline.length}`);
    if (errorSnippet) {
        const found = details.timeline.some((evt) => evt.message.toLowerCase().includes(errorSnippet.toLowerCase()));
        if (!found) {
            throw new Error(`Error text mismatch! Expected snippet "${errorSnippet}" in timeline, but was not found. Timeline: ${JSON.stringify(details.timeline)}`);
        }
    }
    console.log(`   ✔ Profile "${profileName}" verification PASS!\n`);
}
async function verifyAllProfiles() {
    console.log('🏁 Starting Sprint 4 Demo Profiles E2E Integration Suite...');
    // 1. Happy Path
    await runTargetTest('happy_path', 'COMPLETED');
    // 2. Identity Failure
    await runTargetTest('identity_failure', 'FAILED', 'bio-database record');
    // 3. Missing Documents
    await runTargetTest('missing_documents', 'FAILED', 'sale deed document is missing');
    // 4. Wrong Jurisdiction
    await runTargetTest('wrong_jurisdiction', 'FAILED', 'Mumbai Land Tribunal');
    // 5. Duplicate Filing
    await runTargetTest('duplicate_filing', 'FAILED', 'already been registered');
    console.log('🌟 ALL 5 SPRINT 4 SIMULATOR PROFILES VERIFIED PERFECTLY! 🌟');
    process.exit(0);
}
verifyAllProfiles().catch(err => {
    console.error('❌ Integration Verification Failed:', err);
    process.exit(1);
});
export {};
