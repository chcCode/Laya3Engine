/** 事件回调函数，payload 为事件携带的数据。 */
export type EventHandler<T = unknown> = (payload: T) => void;

/** 轻量类型化事件总线，用于模块之间解耦通信。 */
export class EventBus<EventMap extends Record<string, unknown> = Record<string, unknown>> {
    private readonly listeners = new Map<keyof EventMap, Set<EventHandler<any>>>();

    /** 监听事件，返回的函数可用于取消监听。 */
    on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
        let handlers = this.listeners.get(event);
        if (!handlers) {
            handlers = new Set();
            this.listeners.set(event, handlers);
        }

        handlers.add(handler);
        return () => this.off(event, handler);
    }

    /** 监听一次事件，触发后会自动移除。 */
    once<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
        const dispose = this.on(event, (payload) => {
            dispose();
            handler(payload);
        });
        return dispose;
    }

    /** 移除指定事件回调。 */
    off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
        const handlers = this.listeners.get(event);
        if (!handlers) return;

        handlers.delete(handler);
        if (handlers.size === 0) {
            this.listeners.delete(event);
        }
    }

    /** 派发事件并传递事件数据。 */
    emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
        const handlers = this.listeners.get(event);
        if (!handlers) return;

        for (const handler of [...handlers]) {
            handler(payload);
        }
    }

    /** 清理指定事件；不传 event 时清理全部监听。 */
    clear(event?: keyof EventMap): void {
        if (event) {
            this.listeners.delete(event);
            return;
        }

        this.listeners.clear();
    }
}
