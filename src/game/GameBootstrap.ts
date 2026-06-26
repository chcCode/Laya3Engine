import { BaseView, GameApp, GameModule, LayerName } from "../framework";
import { GameConfigManager } from "./config/GameConfigManager";
import { LoginUI, LoginResult } from "./ui/LoginUI";

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
    private login?: LoginUI;
    private app?: GameApp;
    private gameConfigs?: GameConfigManager;

    async start(app: GameApp): Promise<void> {
        this.app = app;
        app.storage.set("lastBootAt", Date.now());

        this.gameConfigs = new GameConfigManager(app.configs);
        await this.gameConfigs.loadAll();
        app.services.register(GameConfigManager, this.gameConfigs);

        console.log("[Game] framework ready", app, this.gameConfigs.requireItem(1001).name);

        this.login = app.ui.open(new LoginUI((result) => this.handleLogin(result)), { layer: LayerName.UI });
    }

    dispose(): void {
        if (this.login) this.app?.ui.close(this.login, true);
        if (this.welcome) this.app?.ui.close(this.welcome, true);
        this.login = undefined;
        this.welcome = undefined;
        this.gameConfigs = undefined;
        this.app = undefined;
    }

    private handleLogin(result: LoginResult): void {
        if (!this.app) return;

        if (this.login) {
            this.app.ui.close(this.login, true);
            this.login = undefined;
        }

        this.app.storage.set("playerName", result.name);
        this.welcome = this.app.ui.open(new WelcomeView(), { layer: LayerName.UI });
        console.log("[Game] login", result);
    }
}
