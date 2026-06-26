const { regClass, property } = Laya;
import { GameApp } from "./framework";
import { GameBootstrap } from "./game/GameBootstrap";

@regClass()
export class Main extends Laya.Script {

    async onStart() {
        await GameApp.I
            .use(new GameBootstrap())
            .boot({
                backgroundColor: "#161b26",
                debug: true,
            });
    }
}
