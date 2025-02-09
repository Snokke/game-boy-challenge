import { Container, Point } from "pixi.js";
import { GAME_BOY_CONFIG } from "../../../../../game-boy/data/game-boy-config";
import { BUTTON_TYPE } from "../../../../../game-boy/data/game-boy-data";
import GameScreenAbstract from "../../../shared/game-screen-abstract";
import { PLAYER_MOVEMENT_STATE } from "../../data/space-invaders-data";
import Player from "./player";
import { SPACE_INVADERS_CONFIG } from "../../data/space-invaders-config";
import EnemiesController from "./enemies-controller/enemies-controller";
import PlayerMissile from "./missile/player-missile";
import { MISSILE_TYPE } from "./missile/missile-config";
import { ENEMIES_CONFIG, ENEMY_CONFIG } from "./enemies-controller/data/enemy-config";
import PlayerLives from "./ui-elements/player-lives";
import Score from "./ui-elements/score";
import EnemyMissile from "./missile/enemy-missile";
import { GAME_BOY_SOUND_TYPE } from "../../../../../game-boy/game-boy-audio/game-boy-audio-data";
import GameBoyAudio from "../../../../../game-boy/game-boy-audio/game-boy-audio";
import { Timeout } from "../../../../../../../core/helpers/timeout";
import Enemy from "./enemies-controller/enemy";

export default class GameplayScreen extends GameScreenAbstract {
  private fieldContainer: Container;
  private player: Player;
  private enemiesController: EnemiesController;
  private playerMissiles: PlayerMissile[];
  private enemyMissiles: EnemyMissile[];
  private isGameActive: boolean;
  private isGamePaused: boolean;
  private playerShootReloadTime: number;
  private playerLives: PlayerLives;
  private score: Score;

  constructor() {
    super();

    this.fieldContainer = null;
    this.player = null;
    this.enemiesController = null;
    this.playerMissiles = [];
    this.enemyMissiles = [];

    this.isGameActive = false;
    this.isGamePaused = false;
    this.playerShootReloadTime = 0;

    this.init();
  }

  public update(dt: number): void {
    if (!this.isGameActive || this.isGamePaused) {
      return;
    }

    this.updatePlayerMovement(dt);
    this.enemiesController.update(dt);
    this.updatePlayerMissiles(dt);
    this.updateEnemyMissiles(dt);

    this.playerShootReloadTime += dt * 1000;
  }

  public show(): void {
    super.show();

    this.isGameActive = true;
    this.enemiesController.spawnEnemies();
  }

  public onButtonPress(buttonType: BUTTON_TYPE): void {
    if (buttonType === BUTTON_TYPE.CrossLeft) {
      this.player.setMovementState(PLAYER_MOVEMENT_STATE.Left);
    }

    if (buttonType === BUTTON_TYPE.CrossRight) {
      this.player.setMovementState(PLAYER_MOVEMENT_STATE.Right);
    }

    if (buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.B) {
      this.playerShoot();
    }
  }

  public onButtonUp(buttonType: BUTTON_TYPE): void {
    if (buttonType === BUTTON_TYPE.CrossLeft && this.player.getMovementState() === PLAYER_MOVEMENT_STATE.Left) {
      this.player.setMovementState(PLAYER_MOVEMENT_STATE.None);
    }

    if (buttonType === BUTTON_TYPE.CrossRight && this.player.getMovementState() === PLAYER_MOVEMENT_STATE.Right) {
      this.player.setMovementState(PLAYER_MOVEMENT_STATE.None);
    }
  }

  public stopTweens(): void {
    this.enemiesController.stopTweens();
  }

  public reset(): void {
    this.isGameActive = false;
    this.isGamePaused = false;
    this.playerShootReloadTime = 0;
    this.enemiesController.reset();
    this.player.reset();
    this.removeAllPlayerMissiles();
    this.removeAllEnemyMissiles();
  }

  public resetLivesScores(): void {
    this.playerLives.reset();
    this.score.reset();
  }

  private removeAllPlayerMissiles(): void {
    this.playerMissiles.forEach(missile => {
      this.fieldContainer.removeChild(missile);
    });

    this.playerMissiles = [];
  }

  private removeAllEnemyMissiles(): void {
    this.enemyMissiles.forEach(missile => {
      this.fieldContainer.removeChild(missile);
    });

    this.enemyMissiles = [];
  }

  private updatePlayerMovement(dt: number): void {
    if (this.player.getMovementState() === PLAYER_MOVEMENT_STATE.Left) {
      const offset = Math.round(SPACE_INVADERS_CONFIG.player.speed * dt * 60);
      this.player.x -= offset;
    }

    if (this.player.getMovementState() === PLAYER_MOVEMENT_STATE.Right) {
      const offset = Math.round(SPACE_INVADERS_CONFIG.player.speed * dt * 60);
      this.player.x += offset;
    }

    if (this.player.x < 0) {
      this.player.x = 0;
    }

    if (this.player.x > SPACE_INVADERS_CONFIG.field.width - this.player.width) {
      this.player.x = SPACE_INVADERS_CONFIG.field.width - this.player.width;
    }
  }

  private updatePlayerMissiles(dt: number): void {
    this.playerMissiles.forEach((missile: PlayerMissile) => {
      if (!missile.isActive()) {
        return;
      }

      const offset: number = Math.round(missile.getSpeed() * dt * 60);
      missile.y -= offset;

      if (missile.y < GAME_BOY_CONFIG.screen.height - SPACE_INVADERS_CONFIG.field.height - 1) {
        this.showPlayerMissileExplode(missile);
      }

      const enemies: Enemy[][] = this.enemiesController.getEnemies();

      for (let row: number = 0; row < ENEMY_CONFIG.rows; row++) {
        for (let column: number = 0; column < ENEMY_CONFIG.columns; column++) {
          const enemy: Enemy = enemies[row][column];

          if (enemy && enemy.getEnemyActive() && enemy.getBounds().rectangle.contains(missile.x, missile.y)) {
            const enemyType: string = enemy.getType();
            const score: number = ENEMIES_CONFIG[enemyType].score;
            this.score.addScore(score);

            this.enemiesController.removeEnemy(enemy);
            this.removePlayerMissile(missile);

            this.enemiesController.updateBottomEnemies();
            GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.EnemyKilled);
          }
        }
      }
    });
  }

  private updateEnemyMissiles(dt: number): void {
    this.enemyMissiles.forEach((missile: EnemyMissile) => {
      if (!missile.isActive()) {
        return;
      }

      const offset: number = Math.round(missile.getSpeed() * dt * 60);
      missile.y += offset;
      missile.updateTexture();

      if (missile.y > SPACE_INVADERS_CONFIG.field.height + 8) {
        this.showEnemyMissileExplode(missile);
      }

      if (!SPACE_INVADERS_CONFIG.playerInvincible && this.player.getBounds().rectangle.contains(missile.x, missile.y)) {
        this.onPlayerHit();
      }
    });
  }

  private onPlayerHit(): void {
    this.isGamePaused = true;
    this.removeAllEnemyMissiles();
    this.playerLives.loseLife();
    this.player.showHit();

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.PlayerKilled);

    Timeout.call(1000, () => {
      this.player.hideHit();
      this.setPlayerStartPosition();
      this.isGamePaused = false;
    });
  }

  private playerShoot(): void {
    if (!this.player.isActive() || this.playerShootReloadTime < SPACE_INVADERS_CONFIG.player.reloadTime) {
      return;
    }

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.PlayerShoot);

    this.playerShootReloadTime = 0;

    const playerPosition: Point = new Point(this.player.x + 3, this.player.y - 7);
    const missile: PlayerMissile = this.createPlayerMissile(playerPosition);
    missile.activate();
    this.playerMissiles.push(missile);
  }

  private enemyShoot(enemy: Enemy): void {
    const type: MISSILE_TYPE = MISSILE_TYPE.Electric;
    const enemyPosition: Point = new Point(enemy.x + 3, enemy.y + 7);
    const missile: EnemyMissile = this.createEnemyMissile(enemyPosition, type);
    missile.activate();
    this.enemyMissiles.push(missile);
  }

  private showPlayerMissileExplode(missile: PlayerMissile): void {
    missile.deactivate();
    missile.explode();

    Timeout.call(300, () => {
      this.removePlayerMissile(missile);
    });
  }

  private showEnemyMissileExplode(missile: EnemyMissile): void {
    missile.deactivate();
    missile.explode();

    Timeout.call(300, () => {
      this.removeEnemyMissile(missile);
    });
  }

  private removePlayerMissile(missile: PlayerMissile): void {
    missile.deactivate();
    const index = this.playerMissiles.indexOf(missile);
    this.playerMissiles.splice(index, 1);
    this.fieldContainer.removeChild(missile);
  }

  private removeEnemyMissile(missile: EnemyMissile): void {
    missile.deactivate();
    const index = this.enemyMissiles.indexOf(missile);
    this.enemyMissiles.splice(index, 1);
    this.fieldContainer.removeChild(missile);
  }

  private createPlayerMissile(position: Point): PlayerMissile {
    const missile = new PlayerMissile();
    this.fieldContainer.addChild(missile);

    missile.x = position.x;
    missile.y = position.y;

    return missile;
  }

  private createEnemyMissile(position: Point, type: MISSILE_TYPE): EnemyMissile {
    const missile = new EnemyMissile(type);
    this.fieldContainer.addChild(missile);

    missile.x = position.x;
    missile.y = position.y;

    return missile;
  }

  private gameOver(): void {
    if (!this.isGameActive) {
      return;
    }

    this.isGameActive = false;

    this.events.emit('onGameOver');
  }

  private enemyReachedBottom(): void {
    if (this.isGamePaused) {
      return;
    }

    this.isGamePaused = true;
    this.player.showHit();
    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.PlayerKilled);

    Timeout.call(1000, () => {
      this.gameOver();
    });
  }

  private setPlayerStartPosition(): void {
    this.player.x = GAME_BOY_CONFIG.screen.width * 0.5 - 8;
    this.player.y = GAME_BOY_CONFIG.screen.height - 8;
  }

  private init(): void {
    this.initFieldContainer();
    this.initPlayer();
    this.initEnemiesController();
    this.initScore();
    this.initPlayerLives();

    this.initSignals();
  }

  private initFieldContainer(): void {
    const fieldContainer: Container = this.fieldContainer = new Container();
    this.addChild(fieldContainer);

    fieldContainer.x = 1;
  }

  private initPlayer(): void {
    const player: Player = this.player = new Player();
    this.fieldContainer.addChild(player);
    this.setPlayerStartPosition();
  }

  private initEnemiesController(): void {
    const enemiesController: EnemiesController = this.enemiesController = new EnemiesController();
    this.fieldContainer.addChild(enemiesController);
  }

  private initScore(): void {
    const score: Score = this.score = new Score();
    this.addChild(score);

    score.x = 10;
    score.y = 2;
  }

  private initPlayerLives(): void {
    const playerLives: PlayerLives = this.playerLives = new PlayerLives();
    this.addChild(playerLives);

    playerLives.x = 120;
    playerLives.y = 2;
  }

  private initSignals(): void {
    this.playerLives.events.on('gameOver', () => this.gameOver());
    this.enemiesController.events.on('enemyReachedBottom', () => this.enemyReachedBottom());
    this.enemiesController.events.on('enemyShoot', (enemy: Enemy) => this.enemyShoot(enemy));
    this.enemiesController.events.on('allEnemiesKilled', () => this.allEnemiesKilled());
    this.score.events.on('onBestScoreChange', () => this.events.emit('onBestScoreChange'));
  }

  private allEnemiesKilled(): void {
    this.removeAllEnemyMissiles();

    Timeout.call(500, () => {
      this.events.emit('onAllEnemiesKilled');
    });
  }
}
