import * as PIXI from "pixi.js";
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
import Delayed from "../../../../../../../core/helpers/delayed-call";
import PlayerLives from "./ui-elements/player-lives";
import Score from "./ui-elements/score";
import EnemyMissile from "./missile/enemy-missile";
import { GAME_BOY_SOUND_TYPE } from "../../../../../game-boy/game-boy-audio/game-boy-audio-data";
import GameBoyAudio from "../../../../../game-boy/game-boy-audio/game-boy-audio";

export default class GameplayScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._fieldContainer = null;
    this._player = null;
    this._enemiesController = null;
    this._playerMissiles = [];
    this._enemyMissiles = [];

    this._isGameActive = false;
    this._isGamePaused = false;
    this._playerShootReloadTime = 0;

    this._init();
  }

  update(dt) {
    if (!this._isGameActive || this._isGamePaused) {
      return;
    }

    this._updatePlayerMovement(dt);
    this._enemiesController.update(dt);
    this._updatePlayerMissiles(dt);
    this._updateEnemyMissiles(dt);

    this._playerShootReloadTime += dt * 1000;
  }

  show() {
    super.show();

    this._isGameActive = true;
    this._enemiesController.spawnEnemies();
  }

  onButtonPress(buttonType) {
    if (buttonType === BUTTON_TYPE.CrossLeft) {
      this._player.setMovementState(PLAYER_MOVEMENT_STATE.Left);
    }

    if (buttonType === BUTTON_TYPE.CrossRight) {
      this._player.setMovementState(PLAYER_MOVEMENT_STATE.Right);
    }

    if (buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.B) {
      this._playerShoot();
    }
  }

  onButtonUp(buttonType) {
    if (buttonType === BUTTON_TYPE.CrossLeft && this._player.getMovementState() === PLAYER_MOVEMENT_STATE.Left) {
      this._player.setMovementState(PLAYER_MOVEMENT_STATE.None);
    }

    if (buttonType === BUTTON_TYPE.CrossRight && this._player.getMovementState() === PLAYER_MOVEMENT_STATE.Right) {
      this._player.setMovementState(PLAYER_MOVEMENT_STATE.None);
    }
  }

  stopTweens() {
    this._enemiesController.stopTweens();
  }

  reset() {
    this._isGameActive = false;
    this._isGamePaused = false;
    this._playerShootReloadTime = 0;
    this._enemiesController.reset();
    this._player.reset();
    this._removeAllPlayerMissiles();
    this._removeAllEnemyMissiles();
  }

  resetLivesScores() {
    this._playerLives.reset();
    this._score.reset();
  }

  _removeAllPlayerMissiles() {
    this._playerMissiles.forEach(missile => {
      this._fieldContainer.removeChild(missile);
    });

    this._playerMissiles = [];
  }

  _removeAllEnemyMissiles() {
    this._enemyMissiles.forEach(missile => {
      this._fieldContainer.removeChild(missile);
    });

    this._enemyMissiles = [];
  }

  _updatePlayerMovement(dt) {
    if (this._player.getMovementState() === PLAYER_MOVEMENT_STATE.Left) {
      const offset = Math.round(SPACE_INVADERS_CONFIG.player.speed * dt * 60);
      this._player.x -= offset;
    }

    if (this._player.getMovementState() === PLAYER_MOVEMENT_STATE.Right) {
      const offset = Math.round(SPACE_INVADERS_CONFIG.player.speed * dt * 60);
      this._player.x += offset;
    }

    if (this._player.x < 0) {
      this._player.x = 0;
    }

    if (this._player.x > SPACE_INVADERS_CONFIG.field.width - this._player.width) {
      this._player.x = SPACE_INVADERS_CONFIG.field.width - this._player.width;
    }
  }

  _updatePlayerMissiles(dt) {
    this._playerMissiles.forEach(missile => {
      if (!missile.isActive()) {
        return;
      }

      const offset = Math.round(missile.getSpeed() * dt * 60);
      missile.y -= offset;

      if (missile.y < GAME_BOY_CONFIG.screen.height - SPACE_INVADERS_CONFIG.field.height - 1) {
        this._showPlayerMissileExplode(missile);
      }

      const enemies = this._enemiesController.getEnemies();

      for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
        for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
          const enemy = enemies[row][column];

          if (enemy && enemy.isActive() && enemy.getBounds().contains(missile.x, missile.y)) {
            const enemyType = enemy.getType();
            const score = ENEMIES_CONFIG[enemyType].score;
            this._score.addScore(score);

            this._enemiesController.removeEnemy(enemy);
            this._removePlayerMissile(missile);

            this._enemiesController.updateBottomEnemies();
            GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.EnemyKilled);
          }
        }
      }
    });
  }

  _updateEnemyMissiles(dt) {
    this._enemyMissiles.forEach(missile => {
      if (!missile.isActive()) {
        return;
      }

      const offset = Math.round(missile.getSpeed() * dt * 60);
      missile.y += offset;
      missile.updateTexture();

      if (missile.y > SPACE_INVADERS_CONFIG.field.height + 8) {
        this._showEnemyMissileExplode(missile);
      }

      if (!SPACE_INVADERS_CONFIG.playerInvincible && this._player.getBounds().contains(missile.x, missile.y)) {
        this._onPlayerHit();
      }
    });
  }

  _onPlayerHit() {
    this._isGamePaused = true;
    this._removeAllEnemyMissiles();
    this._playerLives.loseLife();
    this._player.showHit();

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.PlayerKilled);

    Delayed.call(1000, () => {
      this._player.hideHit();
      this._setPlayerStartPosition();
      this._isGamePaused = false;
    });
  }

  _playerShoot() {
    if (!this._player.isActive() || this._playerShootReloadTime < SPACE_INVADERS_CONFIG.player.reloadTime) {
      return;
    }

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.PlayerShoot);

    this._playerShootReloadTime = 0;

    const playerPosition = new PIXI.Point(this._player.x + 3, this._player.y - 7);
    const missile = this._createPlayerMissile(playerPosition);
    missile.activate();
    this._playerMissiles.push(missile);
  }

  _enemyShoot(enemy) {
    const type = MISSILE_TYPE.Electric;
    const enemyPosition = new PIXI.Point(enemy.x + 3, enemy.y + 7);
    const missile = this._createEnemyMissile(enemyPosition, type);
    missile.activate();
    this._enemyMissiles.push(missile);
  }

  _showPlayerMissileExplode(missile) {
    missile.deactivate();
    missile.explode();

    Delayed.call(300, () => {
      this._removePlayerMissile(missile);
    });
  }

  _showEnemyMissileExplode(missile) {
    missile.deactivate();
    missile.explode();

    Delayed.call(300, () => {
      this._removeEnemyMissile(missile);
    });
  }

  _removePlayerMissile(missile) {
    missile.deactivate();
    const index = this._playerMissiles.indexOf(missile);
    this._playerMissiles.splice(index, 1);
    this._fieldContainer.removeChild(missile);
  }

  _removeEnemyMissile(missile) {
    missile.deactivate();
    const index = this._enemyMissiles.indexOf(missile);
    this._enemyMissiles.splice(index, 1);
    this._fieldContainer.removeChild(missile);
  }

  _createPlayerMissile(position) {
    const missile = new PlayerMissile();
    this._fieldContainer.addChild(missile);

    missile.x = position.x;
    missile.y = position.y;

    return missile;
  }

  _createEnemyMissile(position, type) {
    const missile = new EnemyMissile(type);
    this._fieldContainer.addChild(missile);

    missile.x = position.x;
    missile.y = position.y;

    return missile;
  }

  _gameOver() {
    if (!this._isGameActive) {
      return;
    }

    this._isGameActive = false;

    this.events.emit('onGameOver');
  }

  _enemyReachedBottom() {
    if (this._isGamePaused) {
      return;
    }

    this._isGamePaused = true;
    this._player.showHit();
    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.PlayerKilled);

    Delayed.call(1000, () => {
      this._gameOver();
    });
  }

  _setPlayerStartPosition() {
    this._player.x = GAME_BOY_CONFIG.screen.width * 0.5 - 8;
    this._player.y = GAME_BOY_CONFIG.screen.height - 8;
  }

  _init() {
    this._initFieldContainer();
    this._initPlayer();
    this._initEnemiesController();
    this._initScore();
    this._initPlayerLives();

    this._initSignals();
  }

  _initFieldContainer() {
    const fieldContainer = this._fieldContainer = new PIXI.Container();
    this.addChild(fieldContainer);

    fieldContainer.x = 1;
  }

  _initPlayer() {
    const player = this._player = new Player();
    this._fieldContainer.addChild(player);
    this._setPlayerStartPosition();
  }

  _initEnemiesController() {
    const enemiesController = this._enemiesController = new EnemiesController();
    this._fieldContainer.addChild(enemiesController);
  }

  _initScore() {
    const score = this._score = new Score();
    this.addChild(score);

    score.x = 10;
    score.y = 2;
  }

  _initPlayerLives() {
    const playerLives = this._playerLives = new PlayerLives();
    this.addChild(playerLives);

    playerLives.x = 120;
    playerLives.y = 2;
  }

  _initSignals() {
    this._playerLives.events.on('gameOver', () => this._gameOver());
    this._enemiesController.events.on('enemyReachedBottom', () => this._enemyReachedBottom());
    this._enemiesController.events.on('enemyShoot', (enemy) => this._enemyShoot(enemy));
    this._enemiesController.events.on('allEnemiesKilled', () => this._allEnemiesKilled());
    this._score.events.on('onBestScoreChange', () => this.events.emit('onBestScoreChange'));
  }

  _allEnemiesKilled() {
    this._removeAllEnemyMissiles();

    Delayed.call(500, () => {
      this.events.emit('onAllEnemiesKilled');
    });
  }
}
