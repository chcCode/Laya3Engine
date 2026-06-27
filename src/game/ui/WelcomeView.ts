import { BaseView } from "../../framework";

export class WelcomeView extends BaseView {
    private switchButton?: Laya.Sprite;
    private sceneStatus?: Laya.Text;

    constructor(private readonly prefabRoot: Laya.Sprite) {
        super();
        this.name = "WelcomeView";
        this.mouseThrough = true;
        this.addChild(prefabRoot);
    }

    protected onOpen(): void {
        this.bindPrefabNodes();
        this.switchButton?.on(Laya.Event.CLICK, this, this.switchDemoScene);
    }

    protected onClose(): void {
        this.switchButton?.off(Laya.Event.CLICK, this, this.switchDemoScene);
    }

    private bindPrefabNodes(): void {
        this.switchButton = this.prefabRoot.getChildByName<Laya.Sprite>("SwitchButton");
        this.sceneStatus = this.prefabRoot.getChildByName<Laya.Text>("SceneStatus");
    }

    private async switchDemoScene(): Promise<void> {
        if (!this.sceneStatus) return;

        this.sceneStatus.text = "????? DemoScene...";
        await this.app.scenes.switchTo("resources/scenes/DemoScene.ls", {
            name: "DemoScene",
            closeUI: false,
            clearCurrentSceneRes: true,
        });
        this.sceneStatus.text = `?????${this.app.scenes.currentName}`;
    }
}
