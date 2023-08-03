import * as PIXI from 'pixi.js';
import { ENEMY_CONFIG, ENEMY_MOVEMENT_DIRECTION, ENEMY_TYPE } from './data/enemy-config';
import Enemy from './enemy';
import Delayed from '../../../../../../../../core/helpers/delayed-call';
import { SPACE_INVADERS_CONFIG } from '../../../data/space-invaders-config';

export default class EnemiesController extends PIXI.Container {
  constructor() {
    super();

    this.events = new PIXI.utils.EventEmitter();

    this._movementDirection = ENEMY_MOVEMENT_DIRECTION.Right;
    this._previousMovementDirection = ENEMY_MOVEMENT_DIRECTION.Right;
    this._enemies = [];
    this._removeEnemyTimers = [];
    this._showEnemiesTimers = [];
  }

  update(dt) {
    for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
      for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
        const enemy = this._enemies[row][column];

        if (enemy) {
          enemy.update(dt);
        }
      }
    }
  }

  spawnEnemies() {
    this._createEnemies();
    this._showEnemies();
  }

  getEnemies() {
    return this._enemies;
  }

  stopTweens() {
    for (let i = 0; i < this._removeEnemyTimers.length; i++) {
      const timer = this._removeEnemyTimers[i];

      if (timer) {
        timer.stop();
      }
    }

    this._removeEnemyTimers = [];

    for (let i = 0; i < this._showEnemiesTimers.length; i++) {
      const timer = this._showEnemiesTimers[i];

      if (timer) {
        timer.stop();
      }
    }

    this._showEnemiesTimers = [];
  }

  reset() {
    this.stopTweens();

    if (this._enemies.length !== 0) {
      for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
        for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
          const enemy = this._enemies[row][column];

          if (enemy) {
            this.removeChild(enemy);
          }
        }
      }

      this._enemies = [];
    }

    this._previousMovementDirection = ENEMY_MOVEMENT_DIRECTION.Right;
  }

  removeEnemy(enemy) {
    enemy.kill();

    const removeEnemyTimer = Delayed.call(300, () => {
      const row = this._enemies.findIndex(enemies => enemies.includes(enemy));
      const column = this._enemies[row].findIndex(item => item === enemy);

      this.removeChild(enemy);

      this._enemies[row][column] = null;
    });

    this._removeEnemyTimers.push(removeEnemyTimer);

    if (!this._checkIsAnyEnemyAlive()) {
      this.events.emit('allEnemiesKilled');
    }
  }

  updateBottomEnemies() {
    for (let column = 0; column < this._enemies[0].length; column++) {
      for (let row = this._enemies.length - 1; row >= 0; row--) {
        const enemy = this._enemies[row][column];

        if (enemy && enemy.isActive()) {
          enemy.enableShooting();
          // enemy.setTint(0xff0000);
          break;
        }
      }
    }
  }

  _checkIsAnyEnemyAlive() {
    for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
      for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
        const enemy = this._enemies[row][column];

        if (enemy && enemy.isActive()) {
          return true;
        }
      }
    }

    return false;
  }

  _createEnemies() {
    for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
      this._enemies.push([]);

      for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
        const enemy = new Enemy(ENEMY_TYPE.Enemy01);
        this.addChild(enemy);

        enemy.x = 20 + column * 16;
        enemy.y = 32 + row * 8;

        this._enemies[row].push(enemy);

        this._initSignals(enemy);
      }
    }
  }

  _showEnemies() {
    const delay = 15;

    let index = 0;

    for (let row = ENEMY_CONFIG.rows - 1; row >= 0; row--) {
      for (let column = ENEMY_CONFIG.columns - 1; column >= 0; column--) {
        const timer = Delayed.call(delay * index, () => {
          const enemy = this._enemies[row][column];
          enemy.activate();
          enemy.show();
        });

        this._showEnemiesTimers.push(timer);

        index++;
      }
    }

    Delayed.call(delay * index, () => {
      this.updateBottomEnemies();
    });
  }

  _initSignals(enemy) {
    enemy.events.on('changeDirectionToLeft', () => this._onChangeDirection(ENEMY_MOVEMENT_DIRECTION.Left));
    enemy.events.on('changeDirectionToRight', () => this._onChangeDirection(ENEMY_MOVEMENT_DIRECTION.Right));
    enemy.events.on('shoot', () => this.events.emit('enemyShoot', enemy));
  }

  _onChangeDirection(direction) {
    this._movementDirection = direction;

    if (this._previousMovementDirection === this._movementDirection) {
      return;
    }

    this._previousMovementDirection = this._movementDirection;

    for (let row = ENEMY_CONFIG.rows - 1; row >= 0; row--) {
      for (let column = ENEMY_CONFIG.columns - 1; column >= 0; column--) {
        const enemy = this._enemies[row][column];

        if (enemy) {
          enemy.setDirection(direction);
          enemy.moveDown();
          enemy.increaseSpeed();

          this._checkEnemyReachedBottom(enemy);
        }
      }
    }
  }

  _checkEnemyReachedBottom(enemy) {
    if (enemy.y >= SPACE_INVADERS_CONFIG.field.height - enemy.height + 6) {
      this.events.emit('enemyReachedBottom');
    }
  }
}
