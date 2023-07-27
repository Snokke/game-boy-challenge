import * as PIXI from 'pixi.js';
import { TETRIS_CONFIG } from '../../../data/tetris-config';
import Shape from './shape';
import { ROTATE_TYPE, SHAPE_TYPE } from '../../../data/tetris-data';
import Loader from '../../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../../game-boy/data/game-boy-config';
import { BUTTON_TYPE } from '../../../../../../game-boy/data/game-boy-data';

export default class Field extends PIXI.Container {
  constructor() {
    super();

    this._fieldMap = [];
    this._currentShape = null;
    this._shapeFallTime = 0;

    this._shapeFallInterval = 500;

    this._init();
  }

  update(dt) {
    // this._shapeFallTime += dt * 1000;

    // if (this._shapeFallTime >= this._shapeFallInterval) {
    //   this._shapeFallTime = 0;
    //   this._moveShapeDown();
    // }
  }

  onButtonPress(buttonType) {
    if (buttonType === BUTTON_TYPE.CrossRight) {
      this._moveShapeRight();
    }

    if (buttonType === BUTTON_TYPE.CrossLeft) {
      this._moveShapeLeft();
    }

    if (buttonType === BUTTON_TYPE.A) {
      this._currentShape.rotate(ROTATE_TYPE.Clockwise);
    }

    if (buttonType === BUTTON_TYPE.B) {
      this._currentShape.rotate(ROTATE_TYPE.CounterClockwise);
    }

    // if (buttonType === BUTTON_TYPE.Start) {
    //   this._removeShape();
    // }
  }

  _moveShapeRight() {
    if (this._currentShape === null) {
      return;
    }

    const shapePosition = this._currentShape.getBlockPosition();
    const shapeBlocksView = this._currentShape.getBlocksView();
    const pivot = this._currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock === 1) {
          if (shapePosition.x - pivot.x + column + 1 > TETRIS_CONFIG.field.width - 1) {
            return;
          }
        }
      }
    }

    this._currentShape.moveRight();
  }

  _moveShapeLeft() {
    if (this._currentShape === null) {
      return;
    }

    const shapePosition = this._currentShape.getBlockPosition();
    const shapeBlocksView = this._currentShape.getBlocksView();
    const pivot = this._currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock === 1) {
          if (shapePosition.x - pivot.x + column - 1 < 0) {
            return;
          }
        }
      }
    }

    this._currentShape.moveLeft();
  }

  _moveShapeDown() {
    if (this._currentShape === null) {
      return;
    }

    const shapePosition = this._currentShape.getBlockPosition();
    const shapeBlocksView = this._currentShape.getBlocksView();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock === 1) {
          if (shapePosition.y + row + 1 > TETRIS_CONFIG.field.height - 1) {
            this._removeShape();
            this._createShape(SHAPE_TYPE.S);
            return;
          }
        }
      }
    }

    this._currentShape.moveDown();
  }

  _removeShape() {
    this.removeChild(this._currentShape);
    this._currentShape = null;
  }

  _init() {
    this._initMap();

    this._createShape(SHAPE_TYPE.J);
  }

  _initMap() {
    this.position = TETRIS_CONFIG.field.position;

    for (let row = 0; row < TETRIS_CONFIG.field.height; row++) {
      this._fieldMap[row] = [];

      for (let column = 0; column < TETRIS_CONFIG.field.width; column++) {
        this._fieldMap[row][column] = 0;
      }
    }
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

  _createShape(shapeType) {
    const shape = new Shape(shapeType);
    this.addChild(shape);

    this._currentShape = shape;

    shape.setPosition(5, 5);
  }
}
