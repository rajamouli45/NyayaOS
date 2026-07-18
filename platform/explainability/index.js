import fs from 'fs';
export class ExplainabilityAuditor {
    records = [];
    recordDecision(record) {
        this.records.push(record);
    }
    getRecords() {
        return this.records;
    }
    printTimeline() {
        let output = '\n--- ⚖️ NYAYAOS WORKFLOW EXPLAINABILITY TIMELINE ---\n';
        this.records.forEach((rec, idx) => {
            const icon = rec.status === 'SUCCESS' ? '✓' : '✗';
            output += `[Step ${idx + 1}] ${icon} ${rec.agentName} (ID: ${rec.stepId})\n`;
            output += `       Status:     ${rec.status}\n`;
            output += `       Duration:   ${rec.durationMs}ms\n`;
            output += `       Confidence: ${(rec.confidence * 100).toFixed(1)}%\n`;
            output += `       Reasoning:  "${rec.explanation}"\n`;
            output += `----------------------------------------------------\n`;
        });
        console.log(output);
        try {
            fs.writeFileSync('timeline.log', output, 'utf8');
        }
        catch (e) {
            console.error('Failed to write timeline.log:', e.message || e);
        }
    }
}
