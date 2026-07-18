import fs from 'fs';
import { Workflow, WorkflowStep } from '../../packages/contracts/src/index.js';

export class WorkflowLoader {
    load(filePath: string): Workflow {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Workflow definition file not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        return this.parseYaml(content);
    }

    private parseYaml(yaml: string): Workflow {
        // Simple robust offline line-by-line YAML parser to avoid external library installation blocks.
        const lines = yaml.split('\n');
        let id = '';
        const steps: WorkflowStep[] = [];
        let currentStep: Partial<WorkflowStep> = {};

        lines.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            if (trimmed.startsWith('id:')) {
                id = trimmed.substring(3).trim();
            } else if (trimmed.startsWith('- id:')) {
                if (currentStep.id) {
                    steps.push(currentStep as WorkflowStep);
                }
                currentStep = {
                    id: trimmed.substring(5).trim(),
                    required: true
                };
            } else if (trimmed.startsWith('agentName:')) {
                currentStep.agentName = trimmed.substring(10).trim();
            } else if (trimmed.startsWith('required:')) {
                currentStep.required = trimmed.substring(9).trim() === 'true';
            }
        });

        if (currentStep.id) {
            steps.push(currentStep as WorkflowStep);
        }

        if (!id) {
            throw new Error('Workflow id is missing.');
        }

        return { id, steps };
    }
}
