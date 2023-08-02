import * as PIXI from "pixi.js";
import { GAME_BOY_CONFIG } from "../../../../../game-boy/data/game-boy-config";
import { BUTTON_TYPE } from "../../../../../game-boy/data/game-boy-data";
import GameScreenAbstract from "../../../shared/game-screen-abstract";
import { PLAYER_MOVEMENT_STATE, UNIT_TYPE } from "../../data/space-invaders-data";
import Player from "./player";
import { SPACE_INVADERS_CONFIG } from "../../data/space-invaders-config";
import EnemiesController from "./enemies-controller/enemies-controller";
import Missile from "./missile/missile";
import { MISSILE_CONFIG, MISSILE_TYPE } from "./missile/missile-config";
import { ENEMY_CONFIG } from "./enemies-controller/data/enemy-config";

export default class GameplayScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._fieldContainer = null;
    this._player = null;
    this._enemiesController = null;
    this._playerMissiles = [];
    this._enemyMissiles = [];

    this._init();
  }

  update(dt) {
    this._updatePlayerMovement(dt);
    this._enemiesController.update(dt);
    this._updateMissiles(dt);
  }

  show() {
    super.show();

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

  _updateMissiles(dt) {
    this._playerMissiles.forEach(missile => {
      const offset = Math.round(MISSILE_CONFIG.speed * dt * 60);
      missile.y -= offset;

      if (missile.y < GAME_BOY_CONFIG.screen.height - SPACE_INVADERS_CONFIG.field.height - 1) {
        this._removePlayerMissile(missile);
      }

      const enemies = this._enemiesController.getEnemies();

      for (let row = 0; row < ENEMY_CONFIG.rows; row++) {
        for (let column = 0; column < ENEMY_CONFIG.columns; column++) {
          const enemy = enemies[row][column];

          if (enemy && enemy.getBounds().contains(missile.x, missile.y)) {
            this._enemiesController.removeEnemy(enemy);
            this._removePlayerMissile(missile);
          }
        }
      }
    });
  }

  _playerShoot() {
    const playerPosition = new PIXI.Point(this._player.x + 3, this._player.y - 7);
    const missile = this._createMissile(UNIT_TYPE.Player, playerPosition);
    this._playerMissiles.push(missile);
  }

  _removePlayerMissile(missile) {
    const index = this._playerMissiles.indexOf(missile);
    this._playerMissiles.splice(index, 1);
    this._fieldContainer.removeChild(missile);
  }

  _createMissile(owner, position) {
    let missileType;

    if (owner === UNIT_TYPE.Player) {
      missileType = MISSILE_TYPE.Player;
    }

    const missile = new Missile(missileType, owner);
    this._fieldContainer.addChild(missile);

    missile.x = position.x;
    missile.y = position.y;

    return missile;
  }

  _init() {
    this._initFieldContainer();
    this._initPlayer();
    this._initEnemiesController();
    this._initScore();
  }

  _initFieldContainer() {
    const fieldContainer = this._fieldContainer = new PIXI.Container();
    this.addChild(fieldContainer);

    fieldContainer.x = 1;
  }

  _initPlayer() {
    const player = this._player = new Player();
    this._fieldContainer.addChild(player);

    player.y = GAME_BOY_CONFIG.screen.height - 8;
    player.x = GAME_BOY_CONFIG.screen.width * 0.5 - 8;
  }

  _initEnemiesController() {
    const enemiesController = this._enemiesController = new EnemiesController();
    this._fieldContainer.addChild(enemiesController);
  }

  _initScore() {
    const caption = new PIXI.Text('SCORE', new PIXI.TextStyle({
      fontFamily: 'dogicapixel',
      fontSize: 8,
      fill: GAME_BOY_CONFIG.screen.blackColor,
    }));

    this.addChild(caption);

    caption.x = 20;
    caption.y = 2;

    const scoreText = new PIXI.Text('00000', new PIXI.TextStyle({
      fontFamily: 'dogicapixel',
      fontSize: 8,
      fill: GAME_BOY_CONFIG.screen.blackColor,
    }));

    this.addChild(scoreText);

    scoreText.x = 64;
    scoreText.y = 2;
  }
}
