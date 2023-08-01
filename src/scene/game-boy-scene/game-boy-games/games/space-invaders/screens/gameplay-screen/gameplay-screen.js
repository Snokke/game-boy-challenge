import * as PIXI from "pixi.js";
import { GAME_BOY_CONFIG } from "../../../../../game-boy/data/game-boy-config";
import { BUTTON_TYPE } from "../../../../../game-boy/data/game-boy-data";
import GameScreenAbstract from "../../../shared/game-screen-abstract";
import { MOVEMENT_STATE } from "../../data/space-invaders-data";
import Player from "./player";
import { SPACE_INVADERS_CONFIG } from "../../data/space-invaders-config";

export default class GameplayScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._player = null;
    this._fieldContainer = null;

    this._init();
  }

  update(dt) {
    if (this._player.getMovementState() === MOVEMENT_STATE.Left) {
      const offset = Math.round(SPACE_INVADERS_CONFIG.player.speed * dt * 60);
      this._player.x -= offset;
    }

    if (this._player.getMovementState() === MOVEMENT_STATE.Right) {
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

  onButtonPress(buttonType) {
    if (buttonType === BUTTON_TYPE.CrossLeft) {
      this._player.setMovementState(MOVEMENT_STATE.Left);
    }

    if (buttonType === BUTTON_TYPE.CrossRight) {
      this._player.setMovementState(MOVEMENT_STATE.Right);
    }
  }

  onButtonUp(buttonType) {
    if (buttonType === BUTTON_TYPE.CrossLeft && this._player.getMovementState() === MOVEMENT_STATE.Left) {
      this._player.setMovementState(MOVEMENT_STATE.None);
    }

    if (buttonType === BUTTON_TYPE.CrossRight && this._player.getMovementState() === MOVEMENT_STATE.Right) {
      this._player.setMovementState(MOVEMENT_STATE.None);
    }
  }

  _init() {
    this._initFieldContainer();
    this._initPlayer();
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
  }
}
