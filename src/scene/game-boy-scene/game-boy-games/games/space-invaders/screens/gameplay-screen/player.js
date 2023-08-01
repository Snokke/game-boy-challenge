import * as PIXI from 'pixi.js';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';

export default class Player extends PIXI.Container {
  constructor() {
    super();

    this._view = null;
    this._moveState = null;

    this._init();
  }

  setMovementState(direction) {
    this._moveState = direction;
  }

  getMovementState() {
    return this._moveState;
  }

  _init() {
    const texture = Loader.assets['ui_assets/space-invaders/player'];

    const view = this._view = new PIXI.Sprite(texture);
    this.addChild(view);
    view.tint = GAME_BOY_CONFIG.screen.tint;
  }
}
