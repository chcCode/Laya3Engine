import { BaseView } from "../../framework";

export interface LoginResult {
    /** ???????? */
    name: string;
}

/** ???????? prefab ???????????? */
export class LoginUI extends BaseView {
    private nameInput?: Laya.Input;
    private loginButton?: Laya.Sprite;
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
        this.loginButton?.on(Laya.Event.CLICK, this, this.submit);
        this.nameInput?.on(Laya.Event.ENTER, this, this.submit);
        Laya.timer.callLater(this, () => {
            if (this.nameInput) {
                this.nameInput.focus = true;
            }
        });
    }

    protected onClose(): void {
        this.loginButton?.off(Laya.Event.CLICK, this, this.submit);
        this.nameInput?.off(Laya.Event.ENTER, this, this.submit);
    }

    private bindPrefabNodes(): void {
        const panel = this.prefabRoot.getChildByName<Laya.Sprite>("Panel");
        this.nameInput = panel?.getChildByName<Laya.Input>("NameInput");
        this.loginButton = panel?.getChildByName<Laya.Sprite>("LoginButton");
        this.errorText = panel?.getChildByName<Laya.Text>("ErrorText");
    }

    private submit(): void {
        if (!this.nameInput || !this.errorText) return;

        const name = this.nameInput.text.trim();
        if (name.length === 0) {
            this.errorText.text = "?????????";
            return;
        }

        this.errorText.text = "";
        this.onLogin({ name });
    }
}
