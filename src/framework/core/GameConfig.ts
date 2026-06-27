/** 游戏启动与舞台适配配置。 */
export interface GameConfig {
    /** 设计宽度。 */
    width: number;
    /** 设计高度。 */
    height: number;
    /** Laya 舞台缩放模式。 */
    scaleMode: string;
    /** Laya 舞台屏幕方向模式。 */
    screenMode: string;
    /** 水平对齐方式。 */
    alignH: string;
    /** 垂直对齐方式。 */
    alignV: string;
    /** 舞台背景颜色。 */
    backgroundColor: string;
    /** 是否开启调试标记。 */
    debug: boolean;
}

/** 默认游戏配置，可在 GameApp.boot/configure 时覆盖。 */
export const DefaultGameConfig: GameConfig = {
    width: 750,
    height: 1334,
    scaleMode: Laya.Stage.SCALE_FIXED_AUTO,
    screenMode: "none",
    alignH: Laya.Stage.ALIGN_CENTER,
    alignV: Laya.Stage.ALIGN_MIDDLE,
    backgroundColor: "#1f2430",
    debug: true,
};
