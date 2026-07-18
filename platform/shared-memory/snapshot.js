export class MemorySnapshotTracker {
    snapshots = [];
    takeSnapshot(memory) {
        this.snapshots.push({
            timestamp: new Date(),
            state: memory.getAll()
        });
    }
    getSnapshots() {
        return this.snapshots;
    }
}
