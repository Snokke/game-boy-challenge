import { Container, Text, EventEmitter } from 'pixi.js';
import { SPACE_INVADERS_CONFIG } from '../../../data/space-invaders-config';

export default class Score extends Container {
  public events: EventEmitter;

  private scoreText: Text;
  private score: number;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.scoreText = null;
    this.score = 0;

    this.init();
  }

  public addScore(score: number): void {
    this.score += score;
    this.scoreText.text = this.score.toString().padStart(5, '0');

    if (this.score > SPACE_INVADERS_CONFIG.bestScore) {
      SPACE_INVADERS_CONFIG.bestScore = this.score;
      this.events.emit('onBestScoreChange');
    }
  }

  public reset(): void {
    this.score = 0;
    this.scoreText.text = '00000';
  }

  private init(): void {
    const caption = new Text({
        text: 'SCORE',
        style: {
            fontFamily: 'dogicapixel',
            fontSize: 8,
            fill: 0x000000,
        },
    });
    this.addChild(caption);

    const scoreText = this.scoreText = new Text({
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
