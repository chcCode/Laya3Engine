import { BaseView, GameApp, GameModule, LayerName } from "../framework";
import { GameConfigManager } from "./config/GameConfigManager";
import { LoginUI, LoginResult } from "./ui/LoginUI";

class WelcomeView extends BaseView {
    private title?: Laya.Text;
    private tip?: Laya.Text;
    private switchButton?: Laya.Sprite;
    private switchLabel?: Laya.Text;
    private sceneStatus?: Laya.Text;

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
        this.switchButton?.off(Laya.Event.CLICK, this, this.switchDemoScene);
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

        this.switchButton = new Laya.Sprite();
        this.switchButton.size(360, 58);
        this.switchButton.mouseEnabled = true;
        this.switchButton.on(Laya.Event.CLICK, this, this.switchDemoScene);
        this.addChild(this.switchButton);

        this.switchLabel = new Laya.Text();
        this.switchLabel.text = "切换示例场景";
        this.switchLabel.fontSize = 24;
        this.switchLabel.bold = true;
        this.switchLabel.color = "#ffffff";
        this.switchLabel.mouseEnabled = false;
        this.switchButton.addChild(this.switchLabel);

        this.sceneStatus = new Laya.Text();
        this.sceneStatus.text = "当前场景：启动场景";
        this.sceneStatus.fontSize = 20;
        this.sceneStatus.color = "#9ee7ff";
        this.sceneStatus.align = "center";
        this.sceneStatus.width = 640;
        this.addChild(this.sceneStatus);
    }

    private layout(): void {
        if (!this.title || !this.tip) return;

        this.size(Laya.stage.width, Laya.stage.height);
        this.title.pos((this.width - this.title.textWidth) / 2, this.height * 0.35);
        this.tip.pos((this.width - this.tip.width) / 2, this.title.y + 72);

        if (this.switchButton && this.switchLabel && this.sceneStatus) {
            this.switchButton.pos((this.width - this.switchButton.width) / 2, this.tip.y + 86);
            this.switchButton.graphics.clear();
            this.switchButton.graphics.drawRect(0, 0, this.switchButton.width, this.switchButton.height, "#0f766e");
            this.switchLabel.pos(
                (this.switchButton.width - this.switchLabel.textWidth) / 2,
                (this.switchButton.height - this.switchLabel.textHeight) / 2,
            );
            this.sceneStatus.pos((this.width - this.sceneStatus.width) / 2, this.switchButton.y + 76);
        }
    }

    private async switchDemoScene(): Promise<void> {
        if (!this.sceneStatus) return;

        this.sceneStatus.text = "正在切换到 DemoScene...";
        await this.app.scenes.switchTo("resources/scenes/DemoScene.ls", {
            name: "DemoScene",
            closeUI: false,
            clearCurrentSceneRes: true,
        });
        this.sceneStatus.text = `当前场景：${this.app.scenes.currentName}`;
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
