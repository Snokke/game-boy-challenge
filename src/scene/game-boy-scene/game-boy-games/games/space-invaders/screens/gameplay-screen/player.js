import * as PIXI from 'pixi.js';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import { PLAYER_MOVEMENT_STATE } from '../../data/space-invaders-data';

export default class Player extends PIXI.Container {
  constructor() {
    super();

    this._view = null;
    this._moveState = PLAYER_MOVEMENT_STATE.None;

    this._init();
  }

  setMovementState(direction) {
    this._moveState = direction;
  }

  getMovementState() {
    return this._moveState;
  }

  reset() {
    this._moveState = PLAYER_MOVEMENT_STATE.None;
  }

  _init() {
    const texture = Loader.assets['ui_assets/space-invaders/player'];

    const view = this._view = new PIXI.Sprite(texture);
    this.addChild(view);
    view.tint = GAME_BOY_CONFIG.screen.tint;
  }
}
