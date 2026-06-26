import { BaseView, GameApp, GameModule, LayerName } from "../framework";

class WelcomeView extends BaseView {
    private title?: Laya.Text;
    private tip?: Laya.Text;

    constructor() {
        super();
        this.name = "WelcomeView";
        this.mouseThrough = true;
    }

    protected onOpen(): void {
        this.build();
        Laya.stage.on(Laya.Event.RESIZE, this, this.layout);
        this.layout();
    }

    protected onClose(): void {
        Laya.stage.off(Laya.Event.RESIZE, this, this.layout);
    }

    private build(): void {
        this.title = new Laya.Text();
        this.title.text = "Laya3 通用游戏框架";
        this.title.fontSize = 42;
        this.title.color = "#ffffff";
        this.title.bold = true;
        this.addChild(this.title);

        this.tip = new Laya.Text();
        this.tip.text = "已集成：事件总线 / 服务容器 / 资源 / 场景 / UI层级 / 音频 / 输入 / 本地存档 / 状态机";
        this.tip.fontSize = 24;
        this.tip.color = "#c9d4ff";
        this.tip.wordWrap = true;
        this.tip.width = 640;
        this.addChild(this.tip);
    }

    private layout(): void {
        if (!this.title || !this.tip) return;

        this.size(Laya.stage.width, Laya.stage.height);
        this.title.pos((this.width - this.title.textWidth) / 2, this.height * 0.35);
        this.tip.pos((this.width - this.tip.width) / 2, this.title.y + 72);
    }
}

export class GameBootstrap implements GameModule {
    readonly name = "GameBootstrap";
    private welcome?: WelcomeView;

    start(app: GameApp): void {
        app.storage.set("lastBootAt", Date.now());
        this.welcome = new WelcomeView();
        this.welcome.open(LayerName.UI);
        console.log("[Game] framework ready", app);
    }

    dispose(): void {
        this.welcome?.close(true);
        this.welcome = undefined;
    }
}
