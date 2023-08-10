import * as PIXI from "pixi.js";
import { GAME_BOY_CONFIG } from "../../../../game-boy/data/game-boy-config";
import GameScreenAbstract from "../../shared/game-screen-abstract";
import { SPACE_INVADERS_CONFIG } from "../data/space-invaders-config";
import Delayed from "../../../../../../core/helpers/delayed-call";


export default class RoundScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._timer = null;
    this._roundNumber = null;

    this._init();
  }

  show() {
    super.show();

    this._timer = Delayed.call(1300, () => {
      this.events.emit('onRoundEnd');
    });
  }

  stopTweens() {
    if (this._timer) {
      this._timer.stop();
    }
  }

  updateRound() {
    const roundString = SPACE_INVADERS_CONFIG.currentRound.toString().padStart(2, '0');
    this._roundNumber.text = roundString;
  }

  _init() {
    this._initRoundText();

    this.visible = false;
  }

  _initRoundText() {
    const roundText = new PIXI.Text('ROUND', new PIXI.TextStyle({
      fontFamily: 'dogicapixel',
      fontSize: 8,
      fill: 0x000000,
    }));

    this.addChild(roundText);

    const roundString = SPACE_INVADERS_CONFIG.currentRound.toString().padStart(2, '0');
    const roundNumber = this._roundNumber = new PIXI.Text(roundString, new PIXI.TextStyle({
      fontFamily: 'dogicapixel',
      fontSize: 8,
      fill: 0x000000,
    }));

    this.addChild(roundNumber);

    const readyText = new PIXI.Text('READY!', new PIXI.TextStyle({
      fontFamily: 'dogicapixel',
      fontSize: 8,
      fill: 0x000000,
    }));

    this.addChild(readyText);

    roundText.x = GAME_BOY_CONFIG.screen.width * 0.5 - 20;
    roundText.y = GAME_BOY_CONFIG.screen.height * 0.5 - 20;

    roundNumber.x = GAME_BOY_CONFIG.screen.width * 0.5 - 8;
    roundNumber.y = GAME_BOY_CONFIG.screen.height * 0.5 - 11;

    readyText.x = GAME_BOY_CONFIG.screen.width * 0.5 - 21;
    readyText.y = GAME_BOY_CONFIG.screen.height * 0.5 + 7;
  }
}
