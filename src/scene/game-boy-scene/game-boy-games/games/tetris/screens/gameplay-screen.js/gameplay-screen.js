import * as PIXI from 'pixi.js';
import GameScreenAbstract from '../game-screen-abstract';
import { SCREEN_TYPE } from '../../data/tetris-data';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import Field from './field/field';
import NextShape from './next-shape';

export default class GameplayScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._screenType = SCREEN_TYPE.Gameplay;
    this._field = null;
    this._isGameActive = false;

    this._init();
  }

  update(dt) {
    if (this._isGameActive) {
      this._field.update(dt);
    }
  }

  onButtonPress(buttonType) {
    this._field.onButtonPress(buttonType);
  }

  show() {
    super.show();

    this._startGame();
  }

  _startGame() {
    this._isGameActive = true;
    this._field.startGame();
  }

  _init() {
    this._initBackground();
    this._initField();
    this._initSignals();
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

  _initSignals() {
    this._field.events.on('onChangedNextShape', (shapeType) => this._updateNextShape(shapeType));
  }

  _updateNextShape(shapeType) {
    if (this._nextShape) {
      this.removeChild(this._nextShape);
    }

    const nextShape = this._nextShape = new NextShape(shapeType);
    this.addChild(nextShape);

    nextShape.x = GAME_BOY_CONFIG.screen.width - 40 + nextShape.getWidth() * 0.5;
    nextShape.y = GAME_BOY_CONFIG.screen.height - 40 + nextShape.getHeight() * 0.5;
  }
}
