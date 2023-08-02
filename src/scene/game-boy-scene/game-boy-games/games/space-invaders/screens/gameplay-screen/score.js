import * as PIXI from 'pixi.js';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';

export default class Score extends PIXI.Container {
  constructor() {
    super();

    this._scoreText = null;

    this._init();
  }

  setScore(score) {
    this._scoreText.text = score.toString().padStart(5, '0');
  }

  _init() {
    const caption = new PIXI.Text('SCORE', new PIXI.TextStyle({
      fontFamily: 'dogicapixel',
      fontSize: 8,
      fill: GAME_BOY_CONFIG.screen.blackColor,
    }));

    this.addChild(caption);

    const scoreText = this._scoreText = new PIXI.Text('00000', new PIXI.TextStyle({
      fontFamily: 'dogicapixel',
      fontSize: 8,
      fill: GAME_BOY_CONFIG.screen.blackColor,
    }));

    this.addChild(scoreText);

    scoreText.x = 40;
  }
}
