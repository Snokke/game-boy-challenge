import * as PIXI from 'pixi.js';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import { PLAYER_MOVEMENT_STATE } from '../../data/space-invaders-data';

export default class Player extends PIXI.Container {
  constructor() {
    super();

    this._view = null;
    this._playerHit = null;
    this._moveState = PLAYER_MOVEMENT_STATE.None;
    this._isActive = true;

    this._init();
  }

  setMovementState(direction) {
    this._moveState = direction;
  }

  getMovementState() {
    return this._moveState;
  }

  isActive() {
    return this._isActive;
  }

  reset() {
    this._moveState = PLAYER_MOVEMENT_STATE.None;
    this._isActive = true;
    this._view.visible = true;
    this._playerHit.visible = false;
  }

  showHit() {
    this._view.visible = false;
    this._playerHit.visible = true;
    this._isActive = false;
  }

  hideHit() {
    this._view.visible = true;
    this._playerHit.visible = false;
    this._isActive = true;
  }

  _init() {
    this._initView();
    this._initHit();
  }

  _initView() {
    const texture = Loader.assets['ui_assets/space-invaders/player'];

    const view = this._view = new PIXI.Sprite(texture);
    this.addChild(view);
    view.tint = GAME_BOY_CONFIG.screen.tint;
  }

  _initHit() {
    const texture = Loader.assets['ui_assets/space-invaders/player-hit'];

    const playerHit = this._playerHit = new PIXI.Sprite(texture);
    this.addChild(playerHit);
    playerHit.tint = GAME_BOY_CONFIG.screen.tint;

    playerHit.visible = false;
  }
}
