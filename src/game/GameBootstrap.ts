import { GameApp, GameModule, UILayerName } from "../framework";
import { GameConfigManager } from "./config/GameConfigManager";
import { LoginUI, LoginResult } from "./ui/LoginUI";
import { WelcomeView } from "./ui/WelcomeView";

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

        this.login = await app.ui.openPrefab(
            "resources/prefabs/LoginUI.lh",
            (prefabRoot) => new LoginUI(prefabRoot as Laya.Sprite, (result) => this.handleLogin(result)),
            { layer: UILayerName.Middle },
        );
    }

    dispose(): void {
        if (this.login) this.app?.ui.close(this.login, true);
        if (this.welcome) this.app?.ui.close(this.welcome, true);
        this.login = undefined;
        this.welcome = undefined;
        this.gameConfigs = undefined;
        this.app = undefined;
    }

    private async handleLogin(result: LoginResult): Promise<void> {
        if (!this.app) return;

        if (this.login) {
            this.app.ui.close(this.login, true);
            this.login = undefined;
        }

        this.app.storage.set("playerName", result.name);
        this.welcome = await this.app.ui.openPrefab(
            "resources/prefabs/WelcomeView.lh",
            (prefabRoot) => new WelcomeView(prefabRoot as Laya.Sprite),
            { layer: UILayerName.Middle },
        );
        console.log("[Game] login", result);
    }
}
