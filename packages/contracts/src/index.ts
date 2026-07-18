export interface AgentResult {
    success: boolean;
    output?: any;
    confidence: number;
    explanation: string;
    error?: string;
}

export interface MemoryContext {
    get(key: string): any;
    set(key: string, value: any): void;
    getAll(): Record<string, any>;
    has(key: string): boolean;
}

export interface WorkflowContext {
    workflowId: string;
    caseId: string;
    citizenId: string;
    memory: MemoryContext;
    metadata: {
        startedAt: Date;
        currentStep: string;
        executionId: string;
    };
}

export interface Agent {
    name: string;
    execute(context: WorkflowContext): Promise<AgentResult>;
}

export interface WorkflowStep {
    id: string;
    agentName: string;
    required: boolean;
}

export interface Workflow {
    id: string;
    version?: string;
    steps: WorkflowStep[];
}

export type WorkflowEventType =
    | 'WorkflowStarted'
    | 'AgentStarted'
    | 'AgentCompleted'
    | 'WorkflowCompleted'
    | 'WorkflowFailed';

export interface WorkflowEvent {
    type: WorkflowEventType;
    timestamp: Date;
    workflowId: string;
    payload?: any;
}

export interface MemorySnapshot {
    timestamp: Date;
    state: Record<string, any>;
}

export type EventCallback = (event: WorkflowEvent) => void;
