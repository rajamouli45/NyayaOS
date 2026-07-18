export class SharedMemory {
    state = {};
    get(key) {
        return this.state[key];
    }
    set(key, value) {
        this.state[key] = value;
    }
    has(key) {
        return key in this.state;
    }
    getAll() {
        // Return a shallow copy of the state
        return { ...this.state };
    }
}
