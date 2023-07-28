import * as PIXI from 'pixi.js';
import GameScreenAbstract from '../game-screen-abstract';
import { SCREEN_TYPE } from '../../data/tetris-data';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import Field from './field/field';

export default class GameplayScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._screenType = SCREEN_TYPE.Gameplay;
    this._field = null;

    this._init();
  }

  update(dt) {
    this._field.update(dt);
  }

  onButtonPress(buttonType) {
    this._field.onButtonPress(buttonType);
  }

  _init() {
    this._initBackground();
    this._initField();
  }

  _initBackground() {
    const texture = Loader.assets['ui_assets/tetris/gameplay-screen'];

    const screen = new PIXI.Sprite(texture);
    this.addChild(screen);
    screen.tint = GAME_BOY_CONFIG.screen.tint;
  }

  _initField() {
    const field = this._field = new Field();
    this.addChild(field);
  }
}
