import * as PIXI from 'pixi.js';
import { SPACE_INVADERS_CONFIG } from '../../../data/space-invaders-config';

export default class Score extends PIXI.Container {
  constructor() {
    super();

    this.events = new PIXI.utils.EventEmitter();

    this._scoreText = null;
    this._score = 0;

    this._init();
  }

  addScore(score) {
    this._score += score;
    this._scoreText.text = this._score.toString().padStart(5, '0');

    if (this._score > SPACE_INVADERS_CONFIG.bestScore) {
      SPACE_INVADERS_CONFIG.bestScore = this._score;
      this.events.emit('onBestScoreChange');
    }
  }

  reset() {
    this._score = 0;
    this._scoreText.text = '00000';
  }

  _init() {
    const caption = new PIXI.Text('SCORE', new PIXI.TextStyle({
      fontFamily: 'dogicapixel',
      fontSize: 8,
      fill: 0x000000,
    }));

    this.addChild(caption);

    const scoreText = this._scoreText = new PIXI.Text('00000', new PIXI.TextStyle({
      fontFamily: 'dogicapixel',
      fontSize: 8,
      fill: 0x000000,
    }));

    this.addChild(scoreText);

    scoreText.x = 40;
  }
}
