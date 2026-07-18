import { MemoryContext } from '../../packages/contracts/src/index.js';

export class SharedMemory implements MemoryContext {
    private state: Record<string, any> = {};

    get(key: string): any {
        return this.state[key];
    }

    set(key: string, value: any): void {
        this.state[key] = value;
    }

    has(key: string): boolean {
        return key in this.state;
    }

    getAll(): Record<string, any> {
        // Return a shallow copy of the state
        return { ...this.state };
    }
}
