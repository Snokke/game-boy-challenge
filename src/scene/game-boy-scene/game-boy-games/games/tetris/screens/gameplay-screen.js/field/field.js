import * as PIXI from 'pixi.js';
import { LEVELS_CONFIG, TETRIS_CONFIG } from '../../../data/tetris-config';
import Shape from './shape/shape';
import { LEVEL_TYPE } from '../../../data/tetris-data';
import { BUTTON_TYPE } from '../../../../../../game-boy/data/game-boy-data';
import { ROTATE_TYPE, SHAPE_TYPE } from './shape/shape-config';
import Delayed from '../../../../../../../../core/helpers/delayed-call';

export default class Field extends PIXI.Container {
  constructor() {
    super();

    this.events = new PIXI.utils.EventEmitter();

    this._fieldMap = [];
    this._currentShape = null;
    this._nextShapeType = null;
    this._fieldMapContainer = null;
    this._filledRowAnimationShapes = [];
    this._currentLevel = LEVEL_TYPE.Level01;

    this._shapeFallTime = 0;
    this._shapeFallInterval = LEVELS_CONFIG[this._currentLevel].fallInterval;
    this._isPressUpForFallFast = true;

    this._init();
  }

  update(dt) {
    this._shapeFallTime += dt * 1000;

    if (this._shapeFallTime >= this._shapeFallInterval) {
      this._shapeFallTime = 0;
      this._moveShapeDown();
    }
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  onButtonPress(buttonType) {
    if (buttonType === BUTTON_TYPE.CrossRight) {
      this._moveShapeRight();
    }

    if (buttonType === BUTTON_TYPE.CrossLeft) {
      this._moveShapeLeft();
    }

    if (buttonType === BUTTON_TYPE.CrossDown) {
      this._moveShapeDownFast();
    }

    if (buttonType === BUTTON_TYPE.A) {
      this._rotateShapeClockwise();
    }

    if (buttonType === BUTTON_TYPE.B) {
      this._rotateShapeCounterClockwise();
    }
  }

  onButtonUp(buttonType) {
    if (buttonType === BUTTON_TYPE.CrossDown) {
      this._isPressUpForFallFast = true;
      this._shapeFallInterval = LEVELS_CONFIG[this._currentLevel].fallInterval;
    }
  }

  startGame() {
    const shapeType = this._getRandomShapeType();
    this._spawnShape(shapeType);

    this._nextShapeType = this._getRandomShapeType();
    this.events.emit('onChangedNextShape', this._nextShapeType);
  }

  reset() {
    this._fieldMapContainer.removeChildren();
    this._clearFieldMap();
    this._removeCurrentShape();

    this._nextShapeType = null;
    this._currentLevel = LEVEL_TYPE.Level01;

    this._shapeFallTime = 0;
    this._shapeFallInterval = LEVELS_CONFIG[this._currentLevel].fallInterval;
    this._isPressUpForFallFast = true;
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

            if (this._currentShape.getBlockPosition().y === TETRIS_CONFIG.shapeSpawnPosition.y) {
              this.events.emit('onLose');

              return;
            }

            this._addShapeToFieldMap();
            this._removeCurrentShape();
            this._checkToRemoveFilledRows();

            return;
          }
        }
      }
    }

    this._currentShape.moveDown();
  }

  _moveShapeDownFast() {
    if (this._isPressUpForFallFast) {
      this._shapeFallInterval = TETRIS_CONFIG.fastFallInterval;
      this._isPressUpForFallFast = false;
    }
  }

  _checkToRemoveFilledRows() {
    const filledRows = [];

    for (let row = 0; row < this._fieldMap.length; row++) {
      filledRows[row] = true;

      for (let column = 0; column < this._fieldMap[0].length; column++) {
        if (this._fieldMap[row][column] === null) {
          filledRows[row] = false;
          break;
        }
      }
    }

    if (this._isFilledRows(filledRows)) {
      this._showFilledRowsAnimation(filledRows);
    } else {
      this._afterShapePlaced();
    }
  }

  _isFilledRows(filledRows) {
    for (let row = 0; row < filledRows.length; row++) {
      if (filledRows[row]) {
        return true;
      }
    }

    return false;
  }

  _showFilledRowsAnimation(filledRows) {
    const usedFilledRowAnimationShape = [];

    for (let row = 0; row < filledRows.length; row++) {
      if (filledRows[row]) {
        const filledRowAnimationShape = this._filledRowAnimationShapes.pop();
        filledRowAnimationShape.position.set(0, row * TETRIS_CONFIG.blockSize);
        usedFilledRowAnimationShape.push(filledRowAnimationShape);
      }
    }

    this._blinkFilledRows(usedFilledRowAnimationShape);

    Delayed.call(900, () => {
      this._hideUsedFilledRowAnimationShape(usedFilledRowAnimationShape);
      this._afterFilledRowsAnimation(filledRows);
    });
  }

  _blinkFilledRows(filledRowAnimationShapes) {
    const blinkCount = 3;

    for (let i = 0; i < blinkCount; i++) {
      Delayed.call(300 * i, () => {
        filledRowAnimationShapes.forEach((filledRowAnimationShape) => this._blinkFilledRow(filledRowAnimationShape));
      });
    }
  }

  _blinkFilledRow(filledRowAnimationShape) {
    Delayed.call(150, () => {
      filledRowAnimationShape.visible = true;
    });

    Delayed.call(300, () => {
      filledRowAnimationShape.visible = false;
    });
  }

  _afterFilledRowsAnimation(filledRows) {
    this._removeRowAndMoveRowsDown(filledRows);
    this._afterShapePlaced();
  }

  _removeRowAndMoveRowsDown(filledRows) {
    for (let row = 0; row < filledRows.length; row++) {
      if (filledRows[row]) {
        this._removeRow(row);
        this._moveRowsDown(row);
      }
    }
  }

  _hideUsedFilledRowAnimationShape(usedFilledRowAnimationShape) {
    for (let i = 0; i < usedFilledRowAnimationShape.length; i++) {
      usedFilledRowAnimationShape[i].visible = false;
      this._filledRowAnimationShapes.push(usedFilledRowAnimationShape[i]);
    }
  }

  _afterShapePlaced() {
    this._spawnShape(this._nextShapeType);
    this._nextShapeType = this._getRandomShapeType();
    this.events.emit('onChangedNextShape', this._nextShapeType);

    this._shapeFallInterval = LEVELS_CONFIG[this._currentLevel].fallInterval;
    this._fieldMapContainer.cacheAsBitmap = true;
  }

  _removeRow(row) {
    for (let column = 0; column < this._fieldMap[0].length; column++) {
      const block = this._fieldMap[row][column];
      this._fieldMapContainer.removeChild(block);
      this._fieldMap[row][column] = null;
    }
  }

  _moveRowsDown(row) {
    for (let i = row; i > 0; i--) {
      for (let column = 0; column < this._fieldMap[0].length; column++) {
        this._fieldMap[i][column] = this._fieldMap[i - 1][column];

        const block = this._fieldMap[i][column];

        if (block !== null) {
          block.y += TETRIS_CONFIG.blockSize;
        }
      }
    }

    for (let column = 0; column < this._fieldMap[0].length; column++) {
      this._fieldMap[0][column] = null;
    }
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

  _removeCurrentShape() {
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

    this._initFieldMapContainer();
    this._initFieldMap();
    this._initFilledRowAnimationShapes();
  }

  _initFieldMapContainer() {
    this._fieldMapContainer = new PIXI.Container();
    this.addChild(this._fieldMapContainer);
  }

  _initFieldMap() {
    for (let row = 0; row < TETRIS_CONFIG.field.height; row++) {
      this._fieldMap[row] = [];

      for (let column = 0; column < TETRIS_CONFIG.field.width; column++) {
        this._fieldMap[row][column] = null;
      }
    }
  }

  _initFilledRowAnimationShapes() {
    const filledRowsAnimationShapeCount = 4;

    for (let i = 0; i < filledRowsAnimationShapeCount; i++) {
      const filledRowAnimationShape = new PIXI.Graphics();

      filledRowAnimationShape.beginFill(0x686f4a);
      filledRowAnimationShape.drawRect(0, 0, TETRIS_CONFIG.field.width * TETRIS_CONFIG.blockSize, TETRIS_CONFIG.blockSize);
      filledRowAnimationShape.endFill();

      filledRowAnimationShape.visible = false;

      this.addChild(filledRowAnimationShape);
      this._filledRowAnimationShapes.push(filledRowAnimationShape);
    }
  }

  _spawnShape(shapeType) {
    const shape = this._currentShape = new Shape(shapeType);
    this.addChild(shape);

    const spawnPosition = TETRIS_CONFIG.shapeSpawnPosition;
    shape.setPosition(spawnPosition.x, spawnPosition.y);
  }

  _clearFieldMap() {
    this._fieldMapContainer.cacheAsBitmap = false;

    for (let row = 0; row < this._fieldMap.length; row++) {
      for (let column = 0; column < this._fieldMap[0].length; column++) {
        const block = this._fieldMap[row][column];

        if (block !== null) {
          this._fieldMapContainer.removeChild(block);
          this._fieldMap[row][column] = null;
        }
      }
    }

    this._fieldMapContainer.cacheAsBitmap = true;
  }
}
