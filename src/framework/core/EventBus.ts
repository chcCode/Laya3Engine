export type EventHandler<T = unknown> = (payload: T) => void;

export class EventBus<EventMap extends Record<string, unknown> = Record<string, unknown>> {
    private readonly listeners = new Map<keyof EventMap, Set<EventHandler<any>>>();

    on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
        let handlers = this.listeners.get(event);
        if (!handlers) {
            handlers = new Set();
            this.listeners.set(event, handlers);
        }

        handlers.add(handler);
        return () => this.off(event, handler);
    }

    once<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
        const dispose = this.on(event, (payload) => {
            dispose();
            handler(payload);
        });
        return dispose;
    }

    off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
        const handlers = this.listeners.get(event);
        if (!handlers) return;

        handlers.delete(handler);
        if (handlers.size === 0) {
            this.listeners.delete(event);
        }
    }

    emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
        const handlers = this.listeners.get(event);
        if (!handlers) return;

        for (const handler of [...handlers]) {
            handler(payload);
        }
    }

    clear(event?: keyof EventMap): void {
        if (event) {
            this.listeners.delete(event);
            return;
        }

        this.listeners.clear();
    }
}
