import { Container, Sprite, EventEmitter } from "pixi.js";
import Loader from '../../../../../../../../core/loader';
import { ENEMIES_CONFIG, ENEMY_MOVEMENT_DIRECTION } from './data/enemy-config';
import { SPACE_INVADERS_CONFIG } from '../../../data/space-invaders-config';

export default class Enemy extends Container {
  constructor(type) {
    super();

    this.events = new EventEmitter();

    this._type = type;
    this._config = ENEMIES_CONFIG[type];
    this._view = null;

    this._textureIndex = 0;
    this._isActive = false;

    this._speed = 0.5 + SPACE_INVADERS_CONFIG.currentRound * 0.5;

    if (this._speed > 10) {
      this._speed = 10;
    }

    this._moveTime = 0;
    this._moveInterval = 500 / this._speed;
    this._moveDirection = ENEMY_MOVEMENT_DIRECTION.Right;

    this._isShootingEnabled = false;

    this._init();
  }

  update(dt) {
    if (!this._isActive) {
      return;
    }

    this._moveTime += dt * 1000;

    if (this._moveTime >= this._moveInterval) {
      this._moveTime = 0;
      this._move();
    }

    if (this._isShootingEnabled) {
      this._checkToShoot();
    }
  }

  activate() {
    this._isActive = true;
  }

  isActive() {
    return this._isActive;
  }

  show() {
    this.visible = true;
  }

  getType() {
    return this._type;
  }

  kill() {
    this._isActive = false;

    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures['enemy-kill.png'];
    this._view.texture = texture;
  }

  setDirection(direction) {
    this._moveDirection = direction;
  }

  moveDown() {
    this.y += 12;
  }

  increaseSpeed() {
    this._speed += 1;

    if (this._speed > 15) {
      this._speed = 15;
    }

    this._moveInterval = 500 / this._speed;
  }

  setTint(color) {
    this._view.tint = color;
  }

  enableShooting() {
    this._isShootingEnabled = true;
  }

  _checkToShoot() {
    const chance = Math.random() * 1000;

    if (chance > 998) {
      this.events.emit('shoot');
    }
  }

  _move() {
    if (this.x >= SPACE_INVADERS_CONFIG.field.width - this.width) {
      this.events.emit('changeDirectionToLeft');
    }

    if (this.x <= 0) {
      this.events.emit('changeDirectionToRight');
    }

    if (this._moveDirection === ENEMY_MOVEMENT_DIRECTION.Right) {
      this.x += 1;
    }

    if (this._moveDirection === ENEMY_MOVEMENT_DIRECTION.Left) {
      this.x -= 1;
    }

    this._updateTexture();
  }

  _updateTexture() {
    this._textureIndex = (this._textureIndex + 1) % this._config.textures.length;
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures[this._config.textures[this._textureIndex]];
    this._view.texture = texture;
  }

  _init() {
    this._initView();

    this.visible = false;
  }

  _initView() {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures[this._config.textures[this._textureIndex]];

    const view = this._view = new Sprite(texture);
    this.addChild(view);
  }
}
