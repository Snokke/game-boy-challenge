import * as PIXI from 'pixi.js';
import { LEVELS_CONFIG, TETRIS_CONFIG } from '../../../data/tetris-config';
import Shape from './shape/shape';
import { BUTTON_TYPE } from '../../../../../../game-boy/data/game-boy-data';
import { ROTATE_TYPE, SHAPE_TYPE } from './shape/shape-config';
import Delayed from '../../../../../../../../core/helpers/delayed-call';
import GameBoyAudio from '../../../../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../../../../game-boy/game-boy-audio/game-boy-audio-data';

export default class Field extends PIXI.Container {
  constructor() {
    super();

    this.events = new PIXI.utils.EventEmitter();

    this._fieldMap = [];
    this._currentShape = null;
    this._nextShapeType = null;
    this._fieldMapContainer = null;
    this._filledRowAnimationShapes = [];
    this._currentLevel = TETRIS_CONFIG.startLevel;

    this._linesBlinkTimer = null;
    this._blinkRowShowTimer = null;
    this._blinkRowHideTimer = null;
    this._linesBlinkTimers = [];

    this._filledRowsCount = 0;
    this._filledRowsCountCurrentLevel = 0;
    this._shapeFallTime = 0;
    this._score = 0;
    this._scoreForFallFast = 0;
    this._shapeFallInterval = this._calculateFallInterval();
    this._isPressUpForFallFast = true;
    this._isShapeFallFast = false;

    this._isFallingDisabled = false;
    this._currentRotateType = ROTATE_TYPE.Clockwise;

    this._init();
  }

  update(dt) {
    if (this._isFallingDisabled && !this._isShapeFallFast) {
      return;
    }

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

    if (buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.CrossUp) {
      this._onRotateClockwise();
    }

    if (buttonType === BUTTON_TYPE.B) {
      this._onRotateCounterClockwise();
    }
  }

  onButtonUp(buttonType) {
    if (buttonType === BUTTON_TYPE.CrossDown) {
      this._isPressUpForFallFast = true;
      this._isShapeFallFast = false;
      this._shapeFallInterval = this._calculateFallInterval();
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
    this._currentLevel = TETRIS_CONFIG.startLevel;

    this._shapeFallTime = 0;
    this._filledRowsCount = 0;
    this._filledRowsCountCurrentLevel = 0;
    this._score = 0;
    this._scoreForFallFast = 0;
    this._shapeFallInterval = this._calculateFallInterval();
    this._isPressUpForFallFast = true;
    this._isShapeFallFast = false;
  }

  stopTweens() {
    if (this._linesBlinkTimer) {
      this._linesBlinkTimer.stop();
    }

    if (this._blinkRowShowTimer) {
      this._blinkRowShowTimer.stop();
    }

    if (this._blinkRowHideTimer) {
      this._blinkRowHideTimer.stop();
    }

    this._linesBlinkTimers.forEach((timer) => {
      if (timer) {
        timer.stop();
      }
    });
  }

  switchFalling() {
    this._isFallingDisabled = !this._isFallingDisabled;
  }

  clearBottomLine() {
    const towerHeight = this._getTowerHeight();

    if (towerHeight === 0) {
      return;
    }

    const filledRows = [];

    for (let i = 0; i < this._fieldMap.length; i++) {
      let value = false;

      if (i === this._fieldMap.length - 1) {
        value = true;
      }

      filledRows.push(value);
    }

    this._showFilledRowsAnimation(filledRows);
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
          const checkFieldEdge = shapePosition.x - pivot.x + column + 1 > TETRIS_CONFIG.field.width - 1;
          const checkFieldMap = this._fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column + 1] !== null;
          const isInvisibleShape = this._currentShape.getType() === SHAPE_TYPE.Invisible;
          const check = isInvisibleShape ? checkFieldEdge : (checkFieldMap || checkFieldEdge);

          if (check) {
            return;
          }
        }
      }
    }

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.MoveSide);
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
          const checkFieldEdge = shapePosition.x - pivot.x + column - 1 < 0;
          const checkFieldMap = this._fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column - 1] !== null;
          const isInvisibleShape = this._currentShape.getType() === SHAPE_TYPE.Invisible;
          const check = isInvisibleShape ? checkFieldEdge : (checkFieldMap || checkFieldEdge);

          if (check) {
            return;
          }
        }
      }
    }

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.MoveSide);
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
          const checkEdgeAndFieldMap = ((shapePosition.y - pivot.y + row + 1 > TETRIS_CONFIG.field.height - 1)
            || (this._fieldMap[shapePosition.y - pivot.y + row + 1][shapePosition.x - pivot.x + column] !== null));

          const checkEdge = shapePosition.y - pivot.y + row + 1 > TETRIS_CONFIG.field.height - 1;

          const isInvisibleShape = this._currentShape.getType() === SHAPE_TYPE.Invisible;
          const check = isInvisibleShape ? checkEdge : checkEdgeAndFieldMap;

          if (check) {
            if (this._currentShape.getBlockPosition().y === TETRIS_CONFIG.shapeSpawnPosition.y) {
              this.events.emit('onLose');

              return;
            }

            GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.ShapeFall);

            this._addShapeToFieldMap();
            this._removeCurrentShape();
            this._checkToRemoveFilledRows();

            return;
          }
        }
      }
    }

    this._currentShape.moveDown();

    if (this._isShapeFallFast) {
      this._scoreForFallFast += TETRIS_CONFIG.scoreForSoftDrop;
    }
  }

  _moveShapeDownFast() {
    if (this._currentShape === null) {
      return;
    }

    if (this._isPressUpForFallFast) {
      this._shapeFallInterval = TETRIS_CONFIG.fastFallInterval;
      this._isPressUpForFallFast = false;
      this._isShapeFallFast = true;
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
    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.LineClear);

    const usedFilledRowAnimationShape = [];

    for (let row = 0; row < filledRows.length; row++) {
      if (filledRows[row]) {
        const filledRowAnimationShape = this._filledRowAnimationShapes.pop();
        filledRowAnimationShape.position.set(0, row * TETRIS_CONFIG.blockSize);
        usedFilledRowAnimationShape.push(filledRowAnimationShape);
      }
    }

    this._blinkFilledRows(usedFilledRowAnimationShape);

    this._linesBlinkTimer = Delayed.call(TETRIS_CONFIG.linesBlinkTime * TETRIS_CONFIG.linesBlinkCount, () => {
      this._filledRowsCount += usedFilledRowAnimationShape.length;
      this.events.emit('onFilledRowsCountChange', this._filledRowsCount);

      this._calculateScore(usedFilledRowAnimationShape.length);
      this._checkForNextLevel(usedFilledRowAnimationShape.length);
      this._hideUsedFilledRowAnimationShape(usedFilledRowAnimationShape);
      this._afterFilledRowsAnimation(filledRows);
    });
  }

  _calculateScore(filledRowsCount) {
    const scorePerLine = TETRIS_CONFIG.scorePerLine[filledRowsCount - 1];
    this._score += scorePerLine * (this._currentLevel + 1);
  }

  _checkForNextLevel(filledRowsCount) {
    this._filledRowsCountCurrentLevel += filledRowsCount;
    const filledRowsCountForNextLevel = this._currentLevel * 10 + 10;

    if (this._filledRowsCountCurrentLevel >= filledRowsCountForNextLevel) {
      this._filledRowsCountCurrentLevel = 0;
      this._currentLevel++;

      this.events.emit('onLevelChanged', this._currentLevel);
      this._shapeFallInterval = this._calculateFallInterval();
    }
  }

  _blinkFilledRows(filledRowAnimationShapes) {
    for (let i = 0; i < TETRIS_CONFIG.linesBlinkCount; i++) {
      const timer = Delayed.call(TETRIS_CONFIG.linesBlinkTime * i, () => {
        filledRowAnimationShapes.forEach((filledRowAnimationShape) => this._blinkFilledRow(filledRowAnimationShape));
      });

      this._linesBlinkTimers[i] = timer;
    }
  }

  _blinkFilledRow(filledRowAnimationShape) {
    this._blinkRowShowTimer = Delayed.call(TETRIS_CONFIG.linesBlinkTime * 0.5, () => {
      filledRowAnimationShape.visible = true;
    });

    this._blinkRowHideTimer = Delayed.call(TETRIS_CONFIG.linesBlinkTime, () => {
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
    this._score += this._scoreForFallFast;
    this._scoreForFallFast = 0;
    this.events.emit('onScoreChange', this._score);

    this._spawnShape(this._nextShapeType);
    this._nextShapeType = this._getRandomShapeType();
    this.events.emit('onChangedNextShape', this._nextShapeType);

    this._shapeFallInterval = this._calculateFallInterval();
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

  _onRotateClockwise() {
    const shapeType = this._currentShape.getType();
    if (this._currentShape === null || shapeType === SHAPE_TYPE.O) {
      return;
    }

    this._currentRotateType = ROTATE_TYPE.Clockwise;
    this._rotateShapeClockwise();
  }

  _onRotateCounterClockwise() {
    const shapeType = this._currentShape.getType();
    if (this._currentShape === null || shapeType === SHAPE_TYPE.O) {
      return;
    }

    this._currentRotateType = ROTATE_TYPE.CounterClockwise;
    this._rotateShapeCounterClockwise();
  }

  _rotateShapeClockwise() {
    this._currentShape.rotate(ROTATE_TYPE.Clockwise);
    const check = this._checkIfShapeCanBeRotated(ROTATE_TYPE.Clockwise);

    if (check && this._currentRotateType === ROTATE_TYPE.Clockwise) {
      GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.RotateShape);
    }
  }

  _rotateShapeCounterClockwise() {
    this._currentShape.rotate(ROTATE_TYPE.CounterClockwise);
    const check = this._checkIfShapeCanBeRotated(ROTATE_TYPE.CounterClockwise);

    if (check && this._currentRotateType === ROTATE_TYPE.CounterClockwise) {
      GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.RotateShape);
    }
  }

  _checkIfShapeCanBeRotated(rotateType) {
    const shapePosition = this._currentShape.getBlockPosition();
    const shapeBlocksView = this._currentShape.getBlocksView();
    const pivot = this._currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock !== null) {
          const checkEdgeAndField = (shapePosition.x - pivot.x + column < 0)
            || (shapePosition.x - pivot.x + column > TETRIS_CONFIG.field.width - 1)
            || (shapePosition.y - pivot.y + row < 0)
            || (shapePosition.y - pivot.y + row > TETRIS_CONFIG.field.height - 1)
            || (this._fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column] !== null);

          const checkEdge = (shapePosition.x - pivot.x + column < 0)
            || (shapePosition.x - pivot.x + column > TETRIS_CONFIG.field.width - 1)
            || (shapePosition.y - pivot.y + row < 0)
            || (shapePosition.y - pivot.y + row > TETRIS_CONFIG.field.height - 1);

          const isInvisibleShape = this._currentShape.getType() === SHAPE_TYPE.Invisible;
          const check = isInvisibleShape ? checkEdge : checkEdgeAndField;

          if (check) {
            if (rotateType === ROTATE_TYPE.Clockwise) {
              this._rotateShapeCounterClockwise();
            } else {
              this._rotateShapeClockwise();
            }

            return false;
          }
        }
      }
    }

    return true;
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
          const oldBlock = this._fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column];

          if (oldBlock !== null) {
            this._fieldMapContainer.removeChild(oldBlock);
          }

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
    const standardShapeTypes = [
      SHAPE_TYPE.I,
      SHAPE_TYPE.J,
      SHAPE_TYPE.L,
      SHAPE_TYPE.O,
      SHAPE_TYPE.S,
      SHAPE_TYPE.T,
      SHAPE_TYPE.Z,
    ];

    const shapeTypes = TETRIS_CONFIG.allowInvisibleShape ? [...standardShapeTypes, SHAPE_TYPE.Invisible] : [...standardShapeTypes];
    const randomIndex = Math.floor(Math.random() * shapeTypes.length);

    return shapeTypes[randomIndex];
  }

  _calculateFallInterval() {
    const level = this._currentLevel > LEVELS_CONFIG.length - 1 ? LEVELS_CONFIG.length - 1 : this._currentLevel;

    const framesPerRow = LEVELS_CONFIG[level].framesPerRow;
    return framesPerRow / TETRIS_CONFIG.originalTetrisFramesPerSecond * 1000;
  }

  _getTowerHeight() {
    let towerLinesCount = 0;

    for (let row = 0; row < TETRIS_CONFIG.field.height; row++) {
      let isTowerLine = false;

      for (let column = 0; column < TETRIS_CONFIG.field.width; column++) {
        if (this._fieldMap[row][column] !== null) {
          isTowerLine = true;
          break;
        }
      }

      if (isTowerLine) {
        towerLinesCount++;
      }
    }

    return towerLinesCount;
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
