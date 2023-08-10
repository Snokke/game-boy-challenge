import * as PIXI from 'pixi.js';
import Loader from '../../../../../../../../core/loader';
import { MISSILES_CONFIG, MISSILE_TYPE } from './missile-config';
import { GAME_BOY_CONFIG } from '../../../../../../game-boy/data/game-boy-config';

export default class PlayerMissile extends PIXI.Container {
  constructor() {
    super();

    this._type = MISSILE_TYPE.Player;
    this._config = MISSILES_CONFIG[this._type];
    this._speed = this._config.speed;

    this._isMissileActive = false;

    this._init();
  }

  activate() {
    this._isMissileActive = true;
  }

  deactivate() {
    this._isMissileActive = false;
  }

  isActive() {
    return this._isMissileActive;
  }

  getSpeed() {
    return this._speed;
  }

  explode() {
    const texture = Loader.assets['ui_assets/space-invaders/player-missile-explode'];
    this._view.texture = texture;

    this._view.x -= 2;
    this._view.y -= 5;
  }

  _init() {
    const texture = Loader.assets[this._config.textures[0]];

    const view = this._view = new PIXI.Sprite(texture);
    this.addChild(view);
  }
}
