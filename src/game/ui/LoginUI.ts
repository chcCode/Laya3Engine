import { BaseView } from "../../framework";

export interface LoginResult {
    /** 玩家输入的名字。 */
    name: string;
}

/** 登录界面，负责从 prefab 绑定节点并回调登录结果。 */
export class LoginUI extends BaseView {
    private panel?: Laya.Sprite;
    private title?: Laya.Text;
    private nameInput?: Laya.Input;
    private loginButton?: Laya.Sprite;
    private loginLabel?: Laya.Text;
    private errorText?: Laya.Text;

    constructor(
        private readonly prefabRoot: Laya.Sprite,
        private readonly onLogin: (result: LoginResult) => void,
    ) {
        super();
        this.name = "LoginUI";
        this.mouseThrough = false;
        this.addChild(prefabRoot);
    }

    protected onOpen(): void {
        this.bindPrefabNodes();
        Laya.stage.on(Laya.Event.RESIZE, this, this.layout);
        this.loginButton?.on(Laya.Event.CLICK, this, this.submit);
        this.nameInput?.on(Laya.Event.ENTER, this, this.submit);
        this.layout();
        Laya.timer.callLater(this, () => {
            if (this.nameInput) {
                this.nameInput.focus = true;
            }
        });
    }

    protected onClose(): void {
        Laya.stage.off(Laya.Event.RESIZE, this, this.layout);
        this.loginButton?.off(Laya.Event.CLICK, this, this.submit);
        this.nameInput?.off(Laya.Event.ENTER, this, this.submit);
    }

    private bindPrefabNodes(): void {
        this.panel = this.prefabRoot.getChildByName<Laya.Sprite>("Panel");
        this.title = this.panel?.getChildByName<Laya.Text>("Title");
        this.nameInput = this.panel?.getChildByName<Laya.Input>("NameInput");
        this.loginButton = this.panel?.getChildByName<Laya.Sprite>("LoginButton");
        this.errorText = this.panel?.getChildByName<Laya.Text>("ErrorText");
        this.loginLabel = this.loginButton?.getChildByName<Laya.Text>("LoginLabel");
    }

    private layout(): void {
        this.size(Laya.stage.width, Laya.stage.height);
        this.prefabRoot.size(this.width, this.height);
        this.prefabRoot.graphics.clear();
        this.prefabRoot.graphics.drawRect(0, 0, this.width, this.height, "#121826");

        if (!this.panel || !this.title || !this.nameInput || !this.loginButton || !this.errorText) return;

        const panelWidth = Math.min(520, this.width - 48);
        const panelHeight = 360;
        const panelX = (this.width - panelWidth) / 2;
        const panelY = (this.height - panelHeight) / 2;

        this.panel.pos(panelX, panelY);
        this.panel.size(panelWidth, panelHeight);
        this.panel.graphics.clear();
        this.panel.graphics.drawRect(0, 0, panelWidth, panelHeight, "#243047");
        this.panel.graphics.drawRect(0, 0, panelWidth, 6, "#5eead4");

        this.title.pos((panelWidth - this.title.textWidth) / 2, 44);
        this.nameInput.pos((panelWidth - this.nameInput.width) / 2, 126);
        this.loginButton.pos((panelWidth - this.loginButton.width) / 2, 212);
        this.errorText.pos((panelWidth - this.errorText.width) / 2, 292);

        this.drawButton();
    }

    private drawButton(): void {
        if (!this.loginButton || !this.loginLabel) return;

        this.loginButton.graphics.clear();
        this.loginButton.graphics.drawRect(0, 0, this.loginButton.width, this.loginButton.height, "#2563eb");
        this.loginLabel.pos(
            (this.loginButton.width - this.loginLabel.textWidth) / 2,
            (this.loginButton.height - this.loginLabel.textHeight) / 2,
        );
    }

    private submit(): void {
        if (!this.nameInput || !this.errorText) return;

        const name = this.nameInput.text.trim();
        if (name.length === 0) {
            this.errorText.text = "请输入名字后再登录";
            return;
        }

        this.errorText.text = "";
        this.onLogin({ name });
    }
}
