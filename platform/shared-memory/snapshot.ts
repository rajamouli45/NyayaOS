import { MemorySnapshot } from '../../packages/contracts/src/index.js';
import { SharedMemory } from './memory.js';

export class MemorySnapshotTracker {
    private snapshots: MemorySnapshot[] = [];

    takeSnapshot(memory: SharedMemory): void {
        this.snapshots.push({
            timestamp: new Date(),
            state: memory.getAll()
        });
    }

    getSnapshots(): MemorySnapshot[] {
        return this.snapshots;
    }
}
