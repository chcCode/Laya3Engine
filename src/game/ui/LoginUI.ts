import { BaseView, LayerName } from "../../framework";

export interface LoginResult {
    name: string;
}

export class LoginUI extends BaseView {
    private panel = new Laya.Sprite();
    private title = new Laya.Text();
    private nameInput = new Laya.Input();
    private loginButton = new Laya.Sprite();
    private loginLabel = new Laya.Text();
    private errorText = new Laya.Text();

    constructor(private readonly onLogin: (result: LoginResult) => void) {
        super();
        this.name = "LoginUI";
        this.mouseThrough = false;
    }

    open(layer: LayerName = LayerName.UI): void {
        super.open(layer);
        Laya.timer.callLater(this, () => this.nameInput.focus = true);
    }

    protected onOpen(): void {
        this.build();
        Laya.stage.on(Laya.Event.RESIZE, this, this.layout);
        this.layout();
    }

    protected onClose(): void {
        Laya.stage.off(Laya.Event.RESIZE, this, this.layout);
        this.loginButton.off(Laya.Event.CLICK, this, this.submit);
        this.nameInput.off(Laya.Event.ENTER, this, this.submit);
    }

    private build(): void {
        this.addChild(this.panel);

        this.title.text = "登录游戏";
        this.title.fontSize = 40;
        this.title.bold = true;
        this.title.color = "#ffffff";
        this.panel.addChild(this.title);

        this.nameInput.prompt = "请输入名字";
        this.nameInput.promptColor = "#77839a";
        this.nameInput.fontSize = 26;
        this.nameInput.color = "#1b2433";
        this.nameInput.maxChars = 16;
        this.nameInput.padding = [0, 18, 0, 18];
        this.nameInput.size(420, 64);
        this.nameInput.bgColor = "#ffffff";
        this.nameInput.borderColor = "#94a3b8";
        this.panel.addChild(this.nameInput);

        this.loginButton.size(420, 64);
        this.loginButton.mouseEnabled = true;
        this.panel.addChild(this.loginButton);

        this.loginLabel.text = "登录";
        this.loginLabel.fontSize = 28;
        this.loginLabel.bold = true;
        this.loginLabel.color = "#ffffff";
        this.loginLabel.mouseEnabled = false;
        this.loginButton.addChild(this.loginLabel);

        this.errorText.text = "";
        this.errorText.fontSize = 20;
        this.errorText.color = "#ffb4a8";
        this.errorText.align = "center";
        this.errorText.width = 420;
        this.panel.addChild(this.errorText);

        this.loginButton.on(Laya.Event.CLICK, this, this.submit);
        this.nameInput.on(Laya.Event.ENTER, this, this.submit);
    }

    private layout(): void {
        this.size(Laya.stage.width, Laya.stage.height);
        this.graphics.clear();
        this.graphics.drawRect(0, 0, this.width, this.height, "#121826");

        const panelWidth = Math.min(520, this.width - 48);
        const panelHeight = 360;
        const panelX = (this.width - panelWidth) / 2;
        const panelY = (this.height - panelHeight) / 2;

        this.panel.pos(panelX, panelY);
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
        this.loginButton.graphics.clear();
        this.loginButton.graphics.drawRect(0, 0, this.loginButton.width, this.loginButton.height, "#2563eb");
        this.loginLabel.pos(
            (this.loginButton.width - this.loginLabel.textWidth) / 2,
            (this.loginButton.height - this.loginLabel.textHeight) / 2,
        );
    }

    private submit(): void {
        const name = this.nameInput.text.trim();
        if (name.length === 0) {
            this.errorText.text = "请输入名字后再登录";
            return;
        }

        this.errorText.text = "";
        this.onLogin({ name });
    }
}
