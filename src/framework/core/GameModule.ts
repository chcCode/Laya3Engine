import type { GameApp } from "./GameApp";

/** 可插拔游戏模块接口，用于拆分独立系统生命周期。 */
export interface GameModule {
    /** 模块名称，便于调试和日志定位。 */
    readonly name: string;
    /** 框架服务注册后、模块启动前调用。 */
    init?(app: GameApp): void | Promise<void>;
    /** 游戏启动阶段调用，适合加载首批资源和打开首界面。 */
    start?(app: GameApp): void | Promise<void>;
    /** 每帧更新，dt 单位为秒。 */
    update?(dt: number): void;
    /** 应用销毁或模块卸载时调用。 */
    dispose?(): void;
}
