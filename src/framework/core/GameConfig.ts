export interface GameConfig {
    width: number;
    height: number;
    scaleMode: string;
    screenMode: string;
    alignH: string;
    alignV: string;
    backgroundColor: string;
    debug: boolean;
}

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
