export type ServiceToken<T> = string | symbol | { new (...args: any[]): T };

export class ServiceLocator {
    private readonly services = new Map<ServiceToken<any>, any>();

    register<T>(token: ServiceToken<T>, instance: T): T {
        this.services.set(token, instance);
        return instance;
    }

    get<T>(token: ServiceToken<T>): T {
        if (!this.services.has(token)) {
            throw new Error(`Service is not registered: ${String(token)}`);
        }

        return this.services.get(token) as T;
    }

    tryGet<T>(token: ServiceToken<T>): T | undefined {
        return this.services.get(token) as T | undefined;
    }

    has<T>(token: ServiceToken<T>): boolean {
        return this.services.has(token);
    }

    unregister<T>(token: ServiceToken<T>): void {
        this.services.delete(token);
    }

    clear(): void {
        this.services.clear();
    }
}
