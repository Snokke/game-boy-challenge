import { Text } from "pixi.js";
import { GAME_BOY_CONFIG } from "../../../../game-boy/data/game-boy-config";
import GameScreenAbstract from "../../shared/game-screen-abstract";
import { SPACE_INVADERS_CONFIG } from "../data/space-invaders-config";
import { Timeout, TimeoutInstance } from "../../../../../../core/helpers/timeout";

export default class RoundScreen extends GameScreenAbstract {
  private timer: TimeoutInstance;
  private roundNumber: Text;

  constructor() {
    super();

    this.init();
  }

  public show(): void {
    super.show();

    this.timer = Timeout.call(1300, () => {
      this.events.emit('onRoundEnd');
    });
  }

  public stopTweens(): void {
    if (this.timer) {
      this.timer.stop();
    }
  }

  public updateRound(): void {
    const roundString: string = SPACE_INVADERS_CONFIG.currentRound.toString().padStart(2, '0');
    this.roundNumber.text = roundString;
  }

  public onButtonPress(): void {

  }

  public onButtonUp(): void {

  }

  public update(): void {

  }

  private init(): void {
    this.initRoundText();

    this.visible = false;
  }

  private initRoundText(): void {
    const roundText: Text = new Text({
      text: 'ROUND',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });

    this.addChild(roundText);

    const roundString: string = SPACE_INVADERS_CONFIG.currentRound.toString().padStart(2, '0');
    const roundNumber: Text = this.roundNumber = new Text({
      text: roundString,
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });

    this.addChild(roundNumber);

    const readyText: Text = new Text({
      text: 'READY!',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });

    this.addChild(readyText);

    roundText.x = GAME_BOY_CONFIG.screen.width * 0.5 - 20;
    roundText.y = GAME_BOY_CONFIG.screen.height * 0.5 - 20;

    roundNumber.x = GAME_BOY_CONFIG.screen.width * 0.5 - 8;
    roundNumber.y = GAME_BOY_CONFIG.screen.height * 0.5 - 11;

    readyText.x = GAME_BOY_CONFIG.screen.width * 0.5 - 21;
    readyText.y = GAME_BOY_CONFIG.screen.height * 0.5 + 7;
  }
}
