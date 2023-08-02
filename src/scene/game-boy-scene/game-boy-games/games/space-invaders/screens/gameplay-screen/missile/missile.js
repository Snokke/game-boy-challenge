import * as PIXI from 'pixi.js';
import Loader from '../../../../../../../../core/loader';
import { MISSILES_CONFIG } from './missile-config';
import { GAME_BOY_CONFIG } from '../../../../../../game-boy/data/game-boy-config';

export default class Missile extends PIXI.Container {
  constructor(type, owner) {
    super();

    this._type = type;
    this._owner = owner;
    this._config = MISSILES_CONFIG[type];

    this._textureIndex = 0;

    this._init();
  }

  _init() {
    const texture = Loader.assets[this._config.textures[this._textureIndex]];

    const view = this._view = new PIXI.Sprite(texture);
    this.addChild(view);
    view.tint = GAME_BOY_CONFIG.screen.tint;
  }
}
