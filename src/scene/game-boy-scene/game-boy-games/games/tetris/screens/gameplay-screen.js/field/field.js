import * as PIXI from 'pixi.js';
import { TETRIS_CONFIG } from '../../../data/tetris-config';
import Shape from './shape';
import { SHAPE_TYPE } from '../../../data/tetris-data';
import Loader from '../../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../../game-boy/data/game-boy-config';
import { BUTTON_TYPE } from '../../../../../../game-boy/data/game-boy-data';

export default class Field extends PIXI.Container {
  constructor() {
    super();

    this._fieldMap = [];
    this._currentShape = null;

    this._init();
  }

  update(dt) {

  }

  onButtonPress(buttonType) {
    if (buttonType === BUTTON_TYPE.CrossRight) {
      this._moveShapeRight();
    }

    if (buttonType === BUTTON_TYPE.CrossLeft) {
      this._moveShapeLeft();
    }
  }

  _moveShapeRight() {
    const shapePosition = this._currentShape.getBlockPosition();
    const shapeBlocksView = this._currentShape.getBlocksView();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock === 1) {
          if (shapePosition.x + column + 1 > TETRIS_CONFIG.field.width - 1) {
            return;
          }
        }
      }
    }

    this._currentShape.moveRight();
  }

  _moveShapeLeft() {
    const shapePosition = this._currentShape.getBlockPosition();
    const shapeBlocksView = this._currentShape.getBlocksView();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock === 1) {
          if (shapePosition.x + column - 1 < 0) {
            return;
          }
        }
      }
    }

    this._currentShape.moveLeft();
  }

  _init() {
    this._initMap();
    this._initShape();
  }

  _initMap() {
    this.position = TETRIS_CONFIG.field.position;

    for (let row = 0; row < TETRIS_CONFIG.field.height; row++) {
      this._fieldMap[row] = [];

      for (let column = 0; column < TETRIS_CONFIG.field.width; column++) {
        this._fieldMap[row][column] = 1;
      }
    }

    this._fieldMap[1][1] = 0;

    // this._drawMap();
  }

  _drawMap() {
    for (let row = 0; row < TETRIS_CONFIG.field.height; row++) {
      for (let column = 0; column < TETRIS_CONFIG.field.width; column++) {
        if (this._fieldMap[row][column] === 1) {
          const block = new PIXI.Sprite(Loader.assets['ui_assets/tetris/block-o']);
          this.addChild(block);

          block.tint = GAME_BOY_CONFIG.screen.tint;

          block.x = column * TETRIS_CONFIG.blockSize;
          block.y = row * TETRIS_CONFIG.blockSize;
        }
      }
    }
  }

  _initShape() {
    const shape = this._currentShape = new Shape(SHAPE_TYPE.S);
    this.addChild(shape);

    // shape.setPosition(1, 0);
  }
}
