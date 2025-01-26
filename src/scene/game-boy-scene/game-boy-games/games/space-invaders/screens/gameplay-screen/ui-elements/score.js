import { Container, Text, EventEmitter } from 'pixi.js';
import { SPACE_INVADERS_CONFIG } from '../../../data/space-invaders-config';

export default class Score extends Container {
  constructor() {
    super();

    this.events = new EventEmitter();

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
    const caption = new Text({
        text: 'SCORE',
        style: {
            fontFamily: 'dogicapixel',
            fontSize: 8,
            fill: 0x000000,
        },
    });
    this.addChild(caption);

    const scoreText = this._scoreText = new Text({
        text: '00000',
        style: {
            fontFamily: 'dogicapixel',
            fontSize: 8,
            fill: 0x000000,
        },
    });

    this.addChild(scoreText);

    scoreText.x = 40;
  }
}
