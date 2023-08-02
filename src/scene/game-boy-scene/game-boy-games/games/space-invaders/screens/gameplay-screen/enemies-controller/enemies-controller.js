import * as PIXI from 'pixi.js';
import { ENEMY_CONFIG, ENEMY_TYPE } from './data/enemy-config';
import Enemy from './enemy';
import Delayed from '../../../../../../../../core/helpers/delayed-call';

export default class EnemiesController extends PIXI.Container {
  constructor() {
    super();

    this._enemies = [];
  }

  update(dt) {
    for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
      for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
        const enemy = this._enemies[row][column];
        enemy.update(dt);
      }
    }
  }

  spawnEnemies() {
    this._createEnemies();
    this._showEnemies();
  }

  _createEnemies() {
    for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
      this._enemies.push([]);

      for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
        const enemy = new Enemy(ENEMY_TYPE.Enemy01);
        this.addChild(enemy);

        enemy.x = 20 + column * 16;
        enemy.y = 25 + row * 8;

        this._enemies[row].push(enemy);
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
}
