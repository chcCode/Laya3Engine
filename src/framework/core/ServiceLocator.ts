/** 服务注册标识，可使用字符串、symbol 或类构造器。 */
export type ServiceToken<T> = string | symbol | { new (...args: any[]): T };

/** 全局服务容器，用于管理框架和业务单例服务。 */
export class ServiceLocator {
    private readonly services = new Map<ServiceToken<any>, any>();

    /** 注册服务实例，重复注册会覆盖旧实例。 */
    register<T>(token: ServiceToken<T>, instance: T): T {
        this.services.set(token, instance);
        return instance;
    }

    /** 获取服务实例；未注册时抛出错误。 */
    get<T>(token: ServiceToken<T>): T {
        if (!this.services.has(token)) {
            throw new Error(`Service is not registered: ${String(token)}`);
        }

        return this.services.get(token) as T;
    }

    /** 尝试获取服务实例；未注册时返回 undefined。 */
    tryGet<T>(token: ServiceToken<T>): T | undefined {
        return this.services.get(token) as T | undefined;
    }

    /** 判断服务是否已注册。 */
    has<T>(token: ServiceToken<T>): boolean {
        return this.services.has(token);
    }

    /** 注销服务实例。 */
    unregister<T>(token: ServiceToken<T>): void {
        this.services.delete(token);
    }

    /** 清空所有服务，通常在应用销毁时调用。 */
    clear(): void {
        this.services.clear();
    }
}
