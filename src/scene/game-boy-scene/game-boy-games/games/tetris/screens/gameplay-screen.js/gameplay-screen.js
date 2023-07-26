import * as PIXI from 'pixi.js';
import ScreenAbstract from '../screen-abstract';
import { SCREEN_TYPE } from '../../data/tetris-data';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import { TETRIS_CONFIG } from '../../data/tetris-config';

export default class GameplayScreen extends ScreenAbstract {
  constructor() {
    super();

    this._screenType = SCREEN_TYPE.Gameplay;

    this._field = [];

    this._init();
  }

  update(dt) {

  }

  onButtonPress(buttonType) {

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
    const fieldContainer = this._fieldContainer = new PIXI.Container();
    this.addChild(fieldContainer);

    fieldContainer.position = TETRIS_CONFIG.field.position;

    for (let i = 0; i < TETRIS_CONFIG.field.height; i++) {
      this._field[i] = [];

      for (let j = 0; j < TETRIS_CONFIG.field.width; j++) {
        this._field[i][j] = 1;
      }
    }

    this._field[1][1] = 0;

    // this._drawField();
  }

  _drawField() {
    for (let i = 0; i < TETRIS_CONFIG.field.height; i++) {
      for (let j = 0; j < TETRIS_CONFIG.field.width; j++) {
        if (this._field[i][j] === 1) {
          const block = new PIXI.Sprite(Loader.assets['ui_assets/tetris/block-o']);
          this._fieldContainer.addChild(block);

          block.tint = GAME_BOY_CONFIG.screen.tint;

          block.x = j * TETRIS_CONFIG.blockSize;
          block.y = i * TETRIS_CONFIG.blockSize;
        }
      }
    }
  }
}
