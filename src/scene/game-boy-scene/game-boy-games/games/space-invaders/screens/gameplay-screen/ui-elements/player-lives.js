import { Container, Sprite, EventEmitter } from 'pixi.js';
import Loader from '../../../../../../../../core/loader';
import { SPACE_INVADERS_CONFIG } from '../../../data/space-invaders-config';

export default class PlayerLives extends Container {
  constructor() {
    super();

    this.events = new EventEmitter();

    this._lives = SPACE_INVADERS_CONFIG.player.livesAtStart;
    this._livesViews = [];

    this._init();
  }

  loseLife() {
    this._lives--;

    const lifeView = this._livesViews.pop();
    this.removeChild(lifeView);

    if (this._lives === 0) {
      this.events.emit('gameOver');
    }
  }

  reset() {
    this._lives = SPACE_INVADERS_CONFIG.player.livesAtStart;

    for (let i = 0; i < this._livesViews.length; i++) {
      const lifeView = this._livesViews[i];
      this.removeChild(lifeView);
    }

    this._livesViews = [];

    this._init();
  }

  _init() {
    for (let i = 0; i < SPACE_INVADERS_CONFIG.player.livesAtStart; i++) {
      const lifeView = this._createLifeView();
      this.addChild(lifeView);

      lifeView.x = i * 10;

      this._livesViews.push(lifeView);
    }
  }

  _createLifeView() {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures['player.png'];
    const view = new Sprite(texture);

    return view;
  }
}
