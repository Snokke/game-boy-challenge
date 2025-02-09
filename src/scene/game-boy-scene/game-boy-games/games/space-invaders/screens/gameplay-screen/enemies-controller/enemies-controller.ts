import { Container, EventEmitter } from 'pixi.js';
import { ENEMY_CONFIG, ENEMY_MOVEMENT_DIRECTION, ENEMY_TYPE } from './data/enemy-config';
import Enemy from './enemy';
import { SPACE_INVADERS_CONFIG } from '../../../data/space-invaders-config';
import { Timeout, TimeoutInstance } from '../../../../../../../../core/helpers/timeout';

export default class EnemiesController extends Container {
  public events: EventEmitter;

  private movementDirection: ENEMY_MOVEMENT_DIRECTION;
  private previousMovementDirection: ENEMY_MOVEMENT_DIRECTION;
  private enemies: Enemy[][];
  private removeEnemyTimers: TimeoutInstance[];
  private showEnemiesTimers: TimeoutInstance[];

  constructor() {
    super();

    this.events = new EventEmitter();

    this.movementDirection = ENEMY_MOVEMENT_DIRECTION.Right;
    this.previousMovementDirection = ENEMY_MOVEMENT_DIRECTION.Right;
    this.enemies = [];
    this.removeEnemyTimers = [];
    this.showEnemiesTimers = [];
  }

  public update(dt: number): void {
    for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
      for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
        const enemy: Enemy = this.enemies[row][column];

        if (enemy) {
          enemy.update(dt);
        }
      }
    }
  }

  public spawnEnemies(): void {
    this.createEnemies();
    this.showEnemies();
  }

  public getEnemies(): Enemy[][] {
    return this.enemies;
  }

  public stopTweens(): void {
    for (let i = 0; i < this.removeEnemyTimers.length; i++) {
      const timer: TimeoutInstance = this.removeEnemyTimers[i];

      if (timer) {
        timer.stop();
      }
    }

    this.removeEnemyTimers = [];

    for (let i = 0; i < this.showEnemiesTimers.length; i++) {
      const timer: TimeoutInstance = this.showEnemiesTimers[i];

      if (timer) {
        timer.stop();
      }
    }

    this.showEnemiesTimers = [];
  }

  public reset(): void {
    this.stopTweens();

    if (this.enemies.length !== 0) {
      for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
        for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
          const enemy: Enemy = this.enemies[row][column];

          if (enemy) {
            this.removeChild(enemy);
          }
        }
      }

      this.enemies = [];
    }

    this.previousMovementDirection = ENEMY_MOVEMENT_DIRECTION.Right;
  }

  public removeEnemy(enemy: Enemy): void {
    enemy.kill();

    const removeEnemyTimer: TimeoutInstance = Timeout.call(300, () => {
      const row: number = this.enemies.findIndex(enemies => enemies.includes(enemy));
      const column: number = this.enemies[row].findIndex(item => item === enemy);

      this.removeChild(enemy);

      this.enemies[row][column] = null;
    });

    this.removeEnemyTimers.push(removeEnemyTimer);

    if (!this.checkIsAnyEnemyAlive()) {
      this.events.emit('allEnemiesKilled');
    }
  }

  public updateBottomEnemies(): void {
    for (let column = 0; column < this.enemies[0].length; column++) {
      for (let row = this.enemies.length - 1; row >= 0; row--) {
        const enemy: Enemy = this.enemies[row][column];

        if (enemy && enemy.getEnemyActive()) {
          enemy.enableShooting();
          // enemy.setTint(0xff0000);
          break;
        }
      }
    }
  }

  public createEnemies(): void {
    for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
      this.enemies.push([]);

      for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
        const enemy: Enemy = new Enemy(ENEMY_TYPE.Enemy01);
        this.addChild(enemy);

        enemy.x = 20 + column * 16;
        enemy.y = 32 + row * 8;

        this.enemies[row].push(enemy);

        this.initSignals(enemy);
      }
    }
  }

  public showEnemies(): void {
    const delay: number = 15;

    let index: number = 0;

    for (let row = ENEMY_CONFIG.rows - 1; row >= 0; row--) {
      for (let column = ENEMY_CONFIG.columns - 1; column >= 0; column--) {
        const timer: TimeoutInstance = Timeout.call(delay * index, () => {
          const enemy: Enemy = this.enemies[row][column];
          enemy.activate();
          enemy.show();
        });

        this.showEnemiesTimers.push(timer);

        index++;
      }
    }

    Timeout.call(delay * index, () => {
      this.updateBottomEnemies();
    });
  }

  private checkIsAnyEnemyAlive(): boolean {
    for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
      for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
        const enemy: Enemy = this.enemies[row][column];

        if (enemy && enemy.getEnemyActive()) {
          return true;
        }
      }
    }

    return false;
  }

  private initSignals(enemy: Enemy): void {
    enemy.events.on('changeDirectionToLeft', () => this.onChangeDirection(ENEMY_MOVEMENT_DIRECTION.Left));
    enemy.events.on('changeDirectionToRight', () => this.onChangeDirection(ENEMY_MOVEMENT_DIRECTION.Right));
    enemy.events.on('shoot', () => this.events.emit('enemyShoot', enemy));
  }

  private onChangeDirection(direction: ENEMY_MOVEMENT_DIRECTION): void {
    this.movementDirection = direction;

    if (this.previousMovementDirection === this.movementDirection) {
      return;
    }

    this.previousMovementDirection = this.movementDirection;

    for (let row = ENEMY_CONFIG.rows - 1; row >= 0; row--) {
      for (let column = ENEMY_CONFIG.columns - 1; column >= 0; column--) {
        const enemy: Enemy = this.enemies[row][column];

        if (enemy) {
          enemy.setDirection(direction);
          enemy.moveDown();
          enemy.increaseSpeed();

          this.checkEnemyReachedBottom(enemy);
        }
      }
    }
  }

  private checkEnemyReachedBottom(enemy: Enemy): void {
    if (enemy.y >= SPACE_INVADERS_CONFIG.field.height - enemy.height + 6) {
      this.events.emit('enemyReachedBottom');
    }
  }
}
