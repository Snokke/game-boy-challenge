import { Container, Sprite } from 'pixi.js';
import Loader from '../../../../../../../core/loader';
import { PLAYER_MOVEMENT_STATE } from '../../data/space-invaders-data';

export default class Player extends Container {
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
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures['player.png'];

    const view = this._view = new Sprite(texture);
    this.addChild(view);
  }

  _initHit() {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures['player-hit.png'];

    const playerHit = this._playerHit = new Sprite(texture);
    this.addChild(playerHit);

    playerHit.visible = false;
  }
}
