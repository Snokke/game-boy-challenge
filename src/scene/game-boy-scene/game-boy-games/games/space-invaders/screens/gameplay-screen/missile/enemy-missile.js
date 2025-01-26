import { Container, Sprite } from 'pixi.js';
import Loader from '../../../../../../../../core/loader';
import { MISSILES_CONFIG } from './missile-config';
import { GAME_BOY_CONFIG } from '../../../../../../game-boy/data/game-boy-config';

export default class EnemyMissile extends Container {
  constructor(type) {
    super();

    this._type = type;
    this._config = MISSILES_CONFIG[this._type];
    this._speed = this._config.speed;

    this._isMissileActive = false;
    this._textureIndex = 0;

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
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures['enemy-missile-explode.png'];
    this._view.texture = texture;

    this._view.x -= 2;
  }

  updateTexture() {
    this._textureIndex = (this._textureIndex + 1) % this._config.textures.length;
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures[this._config.textures[this._textureIndex]];
    this._view.texture = texture;
  }

  _init() {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures[this._config.textures[this._textureIndex]];

    const view = this._view = new Sprite(texture);
    this.addChild(view);
  }
}
