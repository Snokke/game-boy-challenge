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

  removeEnemy(enemy) {
    enemy.kill();

    Delayed.call(300, () => {
      const row = this._enemies.findIndex(enemies => enemies.includes(enemy));
      const column = this._enemies[row].findIndex(item => item === enemy);

      this.removeChild(enemy);

      this._enemies[row].splice(column, 1);

      if (this._enemies[row].length === 0) {
        this._enemies.splice(row, 1);
      }
    });
  }

  _createEnemies() {
    for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
      this._enemies.push([]);

      for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
        const enemy = new Enemy(ENEMY_TYPE.Enemy01);
        this.addChild(enemy);

        enemy.x = 12 + column * 16;
        enemy.y = 32 + row * 8;

        this._enemies[row].push(enemy);

        this._initSignals(enemy);
      }
    }
  }

  _showEnemies() {
    const delay = 15;

    let index = 0;

    for (let row = ENEMY_CONFIG.rows - 1; row > 0; row--) {
      for (let column = ENEMY_CONFIG.columns - 1; column > 0; column--) {
        Delayed.call(delay * index, () => {
          const enemy = this._enemies[row][column];
          enemy.activate();
          enemy.show();
        });

        index++;
      }
    }
  }

  _initSignals(enemy) {
    enemy.events.on('changeDirectionToLeft', () => this._onChangeDirection(ENEMY_MOVEMENT_DIRECTION.Left));
    enemy.events.on('changeDirectionToRight', () => this._onChangeDirection(ENEMY_MOVEMENT_DIRECTION.Right));
  }

  _onChangeDirection(direction) {
    this._movementDirection = direction;

    if (this._previousMovementDirection === this._movementDirection) {
      return;
    }

    this._previousMovementDirection = this._movementDirection;

    for (let row = ENEMY_CONFIG.rows - 1; row > 0; row--) {
      for (let column = ENEMY_CONFIG.columns - 1; column > 0; column--) {
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
    if (enemy.y >= SPACE_INVADERS_CONFIG.field.height - enemy.height + 4) {
      this.events.emit('enemyReachedBottom');
    }
  }
}
