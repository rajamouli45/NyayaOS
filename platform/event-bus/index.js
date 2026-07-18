export class EventBus {
    subscribers = new Map();
    subscribe(type, callback) {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, new Set());
        }
        this.subscribers.get(type).add(callback);
    }
    unsubscribe(type, callback) {
        const list = this.subscribers.get(type);
        if (list) {
            list.delete(callback);
        }
    }
    emit(event) {
        const list = this.subscribers.get(event.type);
        if (list) {
            for (const callback of list) {
                try {
                    callback(event);
                }
                catch (error) {
                    console.error(`[EventBus] Error in callback for ${event.type}:`, error);
                }
            }
        }
    }
}
