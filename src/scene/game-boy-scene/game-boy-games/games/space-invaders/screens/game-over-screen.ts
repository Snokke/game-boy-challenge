import { Text } from 'pixi.js';
import { GAME_BOY_CONFIG } from "../../../../game-boy/data/game-boy-config";
import GameScreenAbstract from "../../shared/game-screen-abstract";
import { Timeout, TimeoutInstance } from '../../../../../../core/helpers/timeout';

export default class GameOverScreen extends GameScreenAbstract {
  private timer: TimeoutInstance;

  constructor() {
    super();

    this.timer = null;

    this.init();
  }

  public show(): void {
    super.show();

    this.timer = Timeout.call(2000, () => {
      this.events.emit('onGameOverEnd');
    });
  }

  public stopTweens(): void {
    if (this.timer) {
      this.timer.stop();
    }
  }

  public onButtonPress(): void {

  }

  private init(): void {
    const text = new Text({
      text: 'GAME OVER',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });

    this.addChild(text);

    text.x = GAME_BOY_CONFIG.screen.width * 0.5 - 30;
    text.y = GAME_BOY_CONFIG.screen.height * 0.5 - 4;
  }
}
