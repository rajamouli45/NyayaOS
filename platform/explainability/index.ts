import fs from 'fs';

export interface DecisionRecord {
    stepId: string;
    agentName: string;
    confidence: number;
    explanation: string;
    durationMs: number;
    status: 'SUCCESS' | 'FAILED';
}

export class ExplainabilityAuditor {
    private records: DecisionRecord[] = [];

    recordDecision(record: DecisionRecord): void {
        this.records.push(record);
    }

    getRecords(): DecisionRecord[] {
        return this.records;
    }

    printTimeline(): void {
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
        } catch (e: any) {
            console.error('Failed to write timeline.log:', e.message || e);
        }
    }
}
