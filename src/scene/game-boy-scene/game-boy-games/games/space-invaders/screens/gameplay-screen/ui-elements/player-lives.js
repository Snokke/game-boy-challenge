import * as PIXI from 'pixi.js';
import Loader from '../../../../../../../../core/loader';
import { SPACE_INVADERS_CONFIG } from '../../../data/space-invaders-config';
import { GAME_BOY_CONFIG } from '../../../../../../game-boy/data/game-boy-config';

export default class PlayerLives extends PIXI.Container {
  constructor() {
    super();

    this.events = new PIXI.utils.EventEmitter();

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
    const texture = Loader.assets['ui_assets/space-invaders/player'];

    const view = new PIXI.Sprite(texture);
    view.tint = GAME_BOY_CONFIG.screen.tint;

    return view;
  }
}
