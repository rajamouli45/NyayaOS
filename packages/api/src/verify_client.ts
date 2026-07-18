import { TextDecoder } from 'util';

async function verifyClient() {
    console.log('🚀 API Client Verification starting...');
    const startUrl = 'http://localhost:3001/workflow/start';

    const response = await fetch(startUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            caseType: 'Property Dispute',
            citizenId: 'cit-9988',
            plotId: 'plot-7412A',
            location: 'Bengaluru, Karnataka',
            disputeDescription: 'title dispute possession'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to starts workflow: ' + response.statusText);
    }

    const { executionId } = await response.json();
    console.log('⚡ Workflow started successfully. Exec ID:', executionId);

    // Call GET status endpoint
    const statusRes = await fetch(`http://localhost:3001/workflow/${executionId}/status`);
    const statusData = await statusRes.json();
    console.log('📊 Initial Status Endpoint Check:', statusData.status);

    // Listen to GET live SSE stream endpoint
    console.log('📡 Subscribing to SSE Live Event Stream...');
    const sseUrl = `http://localhost:3001/workflow/${executionId}/live`;
    const sseResponse = await fetch(sseUrl);

    if (!sseResponse.body) {
        throw new Error('No SSE response body');
    }

    const reader = sseResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const eventPayload = JSON.parse(line.substring(6));
                console.log('   [SSE EVENT STREAM]:', eventPayload.type, eventPayload.payload || '');
                if (eventPayload.type === 'WorkflowCompleted') {
                    console.log('🎉 Workflow completed. Displaying result audit trail:');
                    console.log(eventPayload.resultText);
                    process.exit(0);
                }
                if (eventPayload.type === 'WorkflowFailed') {
                    console.error('❌ Workflow failed!');
                    process.exit(1);
                }
            }
        }
    }
}

verifyClient().catch(err => {
    console.error('❌ Verification client error:', err);
    process.exit(1);
});
