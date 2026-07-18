import { WorkflowEvent, WorkflowEventType, EventCallback } from '../../packages/contracts/src/index.js';

export class EventBus {
    private subscribers: Map<WorkflowEventType, Set<EventCallback>> = new Map();

    subscribe(type: WorkflowEventType, callback: EventCallback): void {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, new Set());
        }
        this.subscribers.get(type)!.add(callback);
    }

    unsubscribe(type: WorkflowEventType, callback: EventCallback): void {
        const list = this.subscribers.get(type);
        if (list) {
            list.delete(callback);
        }
    }

    emit(event: WorkflowEvent): void {
        const list = this.subscribers.get(event.type);
        if (list) {
            for (const callback of list) {
                try {
                    callback(event);
                } catch (error) {
                    console.error(`[EventBus] Error in callback for ${event.type}:`, error);
                }
            }
        }
    }
}
