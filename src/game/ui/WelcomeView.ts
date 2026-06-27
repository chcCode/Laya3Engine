import { BaseView, LayerName } from "../../framework";

export class WelcomeView extends BaseView {
    private title?: Laya.Text;
    private tip?: Laya.Text;
    private switchButton?: Laya.Sprite;
    private switchLabel?: Laya.Text;
    private sceneStatus?: Laya.Text;

    constructor(private readonly prefabRoot: Laya.Sprite) {
        super();
        this.name = "WelcomeView";
        this.mouseThrough = true;
        this.addChild(prefabRoot);
    }

    protected onOpen(): void {
        this.bindPrefabNodes();
        Laya.stage.on(Laya.Event.RESIZE, this, this.layout);
        this.switchButton?.on(Laya.Event.CLICK, this, this.switchDemoScene);
        this.layout();
    }

    protected onClose(): void {
        Laya.stage.off(Laya.Event.RESIZE, this, this.layout);
        this.switchButton?.off(Laya.Event.CLICK, this, this.switchDemoScene);
    }

    private bindPrefabNodes(): void {
        this.title = this.prefabRoot.getChildByName<Laya.Text>("Title");
        this.tip = this.prefabRoot.getChildByName<Laya.Text>("Tip");
        this.switchButton = this.prefabRoot.getChildByName<Laya.Sprite>("SwitchButton");
        this.sceneStatus = this.prefabRoot.getChildByName<Laya.Text>("SceneStatus");
        this.switchLabel = this.switchButton?.getChildByName<Laya.Text>("SwitchLabel");
    }

    private layout(): void {
        this.size(Laya.stage.width, Laya.stage.height);
        this.prefabRoot.size(this.width, this.height);

        if (!this.title || !this.tip) return;

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
