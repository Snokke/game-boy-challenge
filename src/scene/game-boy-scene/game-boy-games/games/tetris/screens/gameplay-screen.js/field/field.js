import * as PIXI from 'pixi.js';
import { LEVELS_CONFIG, TETRIS_CONFIG } from '../../../data/tetris-config';
import Shape from './shape/shape';
import { LEVEL_TYPE } from '../../../data/tetris-data';
import { BUTTON_TYPE } from '../../../../../../game-boy/data/game-boy-data';
import { ROTATE_TYPE, SHAPE_TYPE } from './shape/shape-config';

export default class Field extends PIXI.Container {
  constructor() {
    super();

    this.events = new PIXI.utils.EventEmitter();

    this._fieldMap = [];
    this._currentShape = null;
    this._nextShapeType = null;
    this._fieldMapContainer = null;
    this._currentLevel = LEVEL_TYPE.Level01;

    this._shapeFallTime = 0;
    this._shapeFallInterval = LEVELS_CONFIG[this._currentLevel].fallInterval;

    this._init();
  }

  update(dt) {
    this._shapeFallTime += dt * 1000;

    if (this._shapeFallTime >= this._shapeFallInterval) {
      this._shapeFallTime = 0;
      this._moveShapeDown();
    }
  }

  onButtonPress(buttonType) {
    if (buttonType === BUTTON_TYPE.CrossRight) {
      this._moveShapeRight();
    }

    if (buttonType === BUTTON_TYPE.CrossLeft) {
      this._moveShapeLeft();
    }

    if (buttonType === BUTTON_TYPE.A) {
      this._rotateShapeClockwise();
    }

    if (buttonType === BUTTON_TYPE.B) {
      this._rotateShapeCounterClockwise();
    }
  }

  startGame() {
    const shapeType = this._getRandomShapeType();
    this._spawnShape(shapeType);

    this._nextShapeType = this._getRandomShapeType();
    this.events.emit('onChangedNextShape', this._nextShapeType);
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

        if (shapeBlock !== null) {
          if ((shapePosition.x - pivot.x + column + 1 > TETRIS_CONFIG.field.width - 1)
            || (this._fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column + 1] !== null)) {
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

        if (shapeBlock !== null) {
          if ((shapePosition.x - pivot.x + column - 1 < 0)
            || (this._fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column - 1] !== null)) {
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
    const pivot = this._currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock !== null) {
          if ((shapePosition.y - pivot.y + row + 1 > TETRIS_CONFIG.field.height - 1)
            || (this._fieldMap[shapePosition.y - pivot.y + row + 1][shapePosition.x - pivot.x + column] !== null)) {
            this._addShapeToFieldMap();
            this._removeShape();

            this._spawnShape(this._nextShapeType);
            this._nextShapeType = this._getRandomShapeType();
            this.events.emit('onChangedNextShape', this._nextShapeType);

            return;
          }
        }
      }
    }

    this._currentShape.moveDown();
  }

  _rotateShapeClockwise() {
    this._currentShape.rotate(ROTATE_TYPE.Clockwise);
    this._checkIfShapeCanBeRotated(ROTATE_TYPE.Clockwise);
  }

  _rotateShapeCounterClockwise() {
    this._currentShape.rotate(ROTATE_TYPE.CounterClockwise);
    this._checkIfShapeCanBeRotated(ROTATE_TYPE.Clockwise);
  }

  _checkIfShapeCanBeRotated(rotateType) {
    const shapePosition = this._currentShape.getBlockPosition();
    const shapeBlocksView = this._currentShape.getBlocksView();
    const pivot = this._currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock !== null) {
          if ((shapePosition.x - pivot.x + column < 0)
            || (shapePosition.x - pivot.x + column > TETRIS_CONFIG.field.width - 1)
            || (shapePosition.y - pivot.y + row < 0)
            || (shapePosition.y - pivot.y + row > TETRIS_CONFIG.field.height - 1)
            || (this._fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column] !== null)) {

            if (rotateType === ROTATE_TYPE.Clockwise) {
              this._rotateShapeCounterClockwise();
            } else {
              this._rotateShapeClockwise();
            }

            return;
          }
        }
      }
    }
  }

  _removeShape() {
    this.removeChild(this._currentShape);
    this._currentShape = null;
  }

  _addShapeToFieldMap() {
    this._fieldMapContainer.cacheAsBitmap = false;

    const shapePosition = this._currentShape.getBlockPosition();
    const shapeBlocksView = this._currentShape.getBlocksView();
    const pivot = this._currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock !== null) {
          const newBlock = this._createBlockCopy(shapeBlock);

          this._fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column] = newBlock;
          this._fieldMapContainer.addChild(newBlock);

          newBlock.x = (shapePosition.x - pivot.x + column) * TETRIS_CONFIG.blockSize;
          newBlock.y = (shapePosition.y - pivot.y + row) * TETRIS_CONFIG.blockSize;

          this._updateBlockRotation(newBlock, shapeBlock);
        }
      }
    }

    this._fieldMapContainer.cacheAsBitmap = true;
  }

  _createBlockCopy(block) {
    const blockCopy = new PIXI.Sprite(block.texture);
    blockCopy.tint = block.tint;

    return blockCopy;
  }

  _updateBlockRotation(newBlock, shapeBlock) {
    if (this._currentShape.getType() === SHAPE_TYPE.I) {
      newBlock.rotation = shapeBlock.rotation;

      if (newBlock.rotation === Math.PI) {
        newBlock.x += TETRIS_CONFIG.blockSize;
        newBlock.y += TETRIS_CONFIG.blockSize;
      }

      if (newBlock.rotation === Math.PI * 0.5) {
        newBlock.x += TETRIS_CONFIG.blockSize;
      }

      if (newBlock.rotation === -Math.PI * 0.5) {
        newBlock.y += TETRIS_CONFIG.blockSize;
      }
    }
  }

  _getRandomShapeType() {
    const shapeTypes = Object.keys(SHAPE_TYPE);
    const randomIndex = Math.floor(Math.random() * shapeTypes.length);

    return SHAPE_TYPE[shapeTypes[randomIndex]];
  }

  _init() {
    this.position = TETRIS_CONFIG.field.position;

    for (let row = 0; row < TETRIS_CONFIG.field.height; row++) {
      this._fieldMap[row] = [];

      for (let column = 0; column < TETRIS_CONFIG.field.width; column++) {
        this._fieldMap[row][column] = null;
      }
    }

    this._fieldMapContainer = new PIXI.Container();
    this.addChild(this._fieldMapContainer);
  }

  _spawnShape(shapeType) {
    const shape = this._currentShape = new Shape(shapeType);
    this.addChild(shape);

    const spawnPosition = TETRIS_CONFIG.shapeSpawnPosition;
    shape.setPosition(spawnPosition.x, spawnPosition.y);
  }
}
