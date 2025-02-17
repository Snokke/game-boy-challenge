import { Container, Sprite, Graphics, EventEmitter } from 'pixi.js';
import { LEVELS_CONFIG, TETRIS_CONFIG } from '../../../data/tetris-config';
import Shape from './shape/shape';
import { BUTTON_TYPE } from '../../../../../../game-boy/data/game-boy-data';
import { ROTATE_TYPE, SHAPE_TYPE } from './shape/shape-config';
import GameBoyAudio from '../../../../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../../../../game-boy/game-boy-audio/game-boy-audio-data';
import { Timeout } from '../../../../../../../../core/helpers/timeout';

export default class Field extends Container {
  public events: EventEmitter;

  private fieldMap: (Sprite | null)[][];
  private currentShape: Shape | null;
  private nextShapeType: SHAPE_TYPE | null;
  private fieldMapContainer: Container | null;
  private filledRowAnimationShapes: Graphics[];
  private currentLevel: number;

  private linesBlinkTimer: any;
  private blinkRowShowTimer: any;
  private blinkRowHideTimer: any;
  private linesBlinkTimers: any[];
  private filledRowsCount: number;
  private filledRowsCountCurrentLevel: number;
  private shapeFallTime: number;
  private score: number;
  private scoreForFallFast: number;
  private shapeFallInterval: number;
  private isPressUpForFallFast: boolean;
  private isShapeFallFast: boolean;
  private isFallingDisabled: boolean;
  private currentRotateType: ROTATE_TYPE;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.fieldMap = [];
    this.currentShape = null;
    this.nextShapeType = null;
    this.fieldMapContainer = null;
    this.filledRowAnimationShapes = [];
    this.currentLevel = TETRIS_CONFIG.startLevel;

    this.linesBlinkTimer = null;
    this.blinkRowShowTimer = null;
    this.blinkRowHideTimer = null;
    this.linesBlinkTimers = [];

    this.filledRowsCount = 0;
    this.filledRowsCountCurrentLevel = 0;
    this.shapeFallTime = 0;
    this.score = 0;
    this.scoreForFallFast = 0;
    this.shapeFallInterval = this.calculateFallInterval();
    this.isPressUpForFallFast = true;
    this.isShapeFallFast = false;

    this.isFallingDisabled = false;
    this.currentRotateType = ROTATE_TYPE.Clockwise;

    this.init();
  }

  public update(dt: number): void {
    if (this.isFallingDisabled && !this.isShapeFallFast) {
      return;
    }

    this.shapeFallTime += dt * 1000;

    if (this.shapeFallTime >= this.shapeFallInterval) {
      this.shapeFallTime = 0;
      this.moveShapeDown();
    }
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public onButtonPress(buttonType: BUTTON_TYPE): void {
    if (buttonType === BUTTON_TYPE.CrossRight) {
      this.moveShapeRight();
    }

    if (buttonType === BUTTON_TYPE.CrossLeft) {
      this.moveShapeLeft();
    }

    if (buttonType === BUTTON_TYPE.CrossDown) {
      this.moveShapeDownFast();
    }

    if (buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.CrossUp) {
      this.onRotateClockwise();
    }

    if (buttonType === BUTTON_TYPE.B) {
      this.onRotateCounterClockwise();
    }
  }

  public onButtonUp(buttonType: BUTTON_TYPE): void {
    if (buttonType === BUTTON_TYPE.CrossDown) {
      this.isPressUpForFallFast = true;
      this.isShapeFallFast = false;
      this.shapeFallInterval = this.calculateFallInterval();
    }
  }

  public startGame(): void {
    const shapeType = this.getRandomShapeType();
    this.spawnShape(shapeType);

    this.nextShapeType = this.getRandomShapeType();
    this.events.emit('onChangedNextShape', this.nextShapeType);
  }

  public reset(): void {
    this.fieldMapContainer.removeChildren();
    this.clearFieldMap();
    this.removeCurrentShape();

    this.nextShapeType = null;
    this.currentLevel = TETRIS_CONFIG.startLevel;

    this.shapeFallTime = 0;
    this.filledRowsCount = 0;
    this.filledRowsCountCurrentLevel = 0;
    this.score = 0;
    this.scoreForFallFast = 0;
    this.shapeFallInterval = this.calculateFallInterval();
    this.isPressUpForFallFast = true;
    this.isShapeFallFast = false;
  }

  public stopTweens(): void {
    if (this.linesBlinkTimer) {
      this.linesBlinkTimer.stop();
    }

    if (this.blinkRowShowTimer) {
      this.blinkRowShowTimer.stop();
    }

    if (this.blinkRowHideTimer) {
      this.blinkRowHideTimer.stop();
    }

    this.linesBlinkTimers.forEach((timer: any) => {
      if (timer) {
        timer.stop();
      }
    });
  }

  public switchFalling(): void {
    this.isFallingDisabled = !this.isFallingDisabled;
  }

  public clearBottomLine(): void {
    const towerHeight = this.getTowerHeight();

    if (towerHeight === 0 || (this.linesBlinkTimer && this.linesBlinkTimer.isPlaying)) {
      return;
    }

    const filledRows: boolean[] = [];

    for (let i = 0; i < this.fieldMap.length; i++) {
      let value = false;

      if (i === this.fieldMap.length - 1) {
        value = true;
      }

      filledRows.push(value);
    }

    this.fieldMapContainer.cacheAsTexture(true);
    this.showFilledRowsAnimation(filledRows, true);
  }

  private moveShapeRight(): void {
    if (this.currentShape === null) {
      return;
    }

    const shapePosition = this.currentShape.getBlockPosition();
    const shapeBlocksView = this.currentShape.getBlocksView();
    const pivot = this.currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock !== null) {
          const checkFieldEdge = shapePosition.x - pivot.x + column + 1 > TETRIS_CONFIG.field.width - 1;
          const checkFieldMap = this.fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column + 1] !== null;
          const isInvisibleShape = this.currentShape.getType() === SHAPE_TYPE.Invisible;
          const check = isInvisibleShape ? checkFieldEdge : (checkFieldMap || checkFieldEdge);

          if (check) {
            return;
          }
        }
      }
    }

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.MoveSide);
    this.currentShape.moveRight();
  }

  private moveShapeLeft(): void {
    if (this.currentShape === null) {
      return;
    }

    const shapePosition = this.currentShape.getBlockPosition();
    const shapeBlocksView = this.currentShape.getBlocksView();
    const pivot = this.currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock !== null) {
          const checkFieldEdge = shapePosition.x - pivot.x + column - 1 < 0;
          const checkFieldMap = this.fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column - 1] !== null;
          const isInvisibleShape = this.currentShape.getType() === SHAPE_TYPE.Invisible;
          const check = isInvisibleShape ? checkFieldEdge : (checkFieldMap || checkFieldEdge);

          if (check) {
            return;
          }
        }
      }
    }

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.MoveSide);
    this.currentShape.moveLeft();
  }

  private moveShapeDown(): void {
    if (this.currentShape === null) {
      return;
    }

    const shapePosition = this.currentShape.getBlockPosition();
    const shapeBlocksView = this.currentShape.getBlocksView();
    const pivot = this.currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock !== null) {
          const checkEdgeAndFieldMap = ((shapePosition.y - pivot.y + row + 1 > TETRIS_CONFIG.field.height - 1)
            || (this.fieldMap[shapePosition.y - pivot.y + row + 1][shapePosition.x - pivot.x + column] !== null));

          const checkEdge = shapePosition.y - pivot.y + row + 1 > TETRIS_CONFIG.field.height - 1;

          const isInvisibleShape = this.currentShape.getType() === SHAPE_TYPE.Invisible;
          const check = isInvisibleShape ? checkEdge : checkEdgeAndFieldMap;

          if (check) {
            if (this.currentShape.getBlockPosition().y === TETRIS_CONFIG.shapeSpawnPosition.y) {
              this.events.emit('onLose');

              return;
            }

            GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.ShapeFall);

            this.addShapeToFieldMap();
            this.removeCurrentShape();
            this.checkToRemoveFilledRows();

            return;
          }
        }
      }
    }

    this.currentShape.moveDown();

    if (this.isShapeFallFast) {
      this.scoreForFallFast += TETRIS_CONFIG.scoreForSoftDrop;
    }
  }

  private moveShapeDownFast(): void {
    if (this.currentShape === null) {
      return;
    }

    if (this.isPressUpForFallFast) {
      this.shapeFallInterval = TETRIS_CONFIG.fastFallInterval;
      this.isPressUpForFallFast = false;
      this.isShapeFallFast = true;
    }
  }

  private checkToRemoveFilledRows(): void {
    const filledRows: boolean[] = [];

    for (let row = 0; row < this.fieldMap.length; row++) {
      filledRows[row] = true;

      for (let column = 0; column < this.fieldMap[0].length; column++) {
        if (this.fieldMap[row][column] === null) {
          filledRows[row] = false;
          break;
        }
      }
    }

    if (this.isFilledRows(filledRows)) {
      this.showFilledRowsAnimation(filledRows);
    } else {
      this.afterShapePlaced();
    }
  }

  private isFilledRows(filledRows: boolean[]): boolean {
    for (let row = 0; row < filledRows.length; row++) {
      if (filledRows[row]) {
        return true;
      }
    }

    return false;
  }

  private showFilledRowsAnimation(filledRows: boolean[], debugClear = false): void {
    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.LineClear);

    const usedFilledRowAnimationShape: Graphics[] = [];

    for (let row = 0; row < filledRows.length; row++) {
      if (filledRows[row]) {
        const filledRowAnimationShape = this.filledRowAnimationShapes.pop();
        if (filledRowAnimationShape) {
          filledRowAnimationShape.position.set(0, row * TETRIS_CONFIG.blockSize);
          usedFilledRowAnimationShape.push(filledRowAnimationShape);
        }
      }
    }

    this.blinkFilledRows(usedFilledRowAnimationShape, debugClear);

    const time = debugClear ? TETRIS_CONFIG.linesBlinkTime : TETRIS_CONFIG.linesBlinkTime * TETRIS_CONFIG.linesBlinkCount;

    this.linesBlinkTimer = Timeout.call(time, () => {
      this.filledRowsCount += usedFilledRowAnimationShape.length;
      this.events.emit('onFilledRowsCountChange', this.filledRowsCount);

      this.calculateScore(usedFilledRowAnimationShape.length);
      this.checkForNextLevel(usedFilledRowAnimationShape.length);
      this.hideUsedFilledRowAnimationShape(usedFilledRowAnimationShape);
      this.afterFilledRowsAnimation(filledRows, debugClear);
    });
  }

  private calculateScore(filledRowsCount: number): void {
    const scorePerLine = TETRIS_CONFIG.scorePerLine[filledRowsCount - 1];
    this.score += scorePerLine * (this.currentLevel + 1);
  }

  private checkForNextLevel(filledRowsCount: number): void {
    this.filledRowsCountCurrentLevel += filledRowsCount;
    const filledRowsCountForNextLevel = this.currentLevel * 10 + 10;

    if (this.filledRowsCountCurrentLevel >= filledRowsCountForNextLevel) {
      this.filledRowsCountCurrentLevel = 0;
      this.currentLevel++;

      this.events.emit('onLevelChanged', this.currentLevel);
      this.shapeFallInterval = this.calculateFallInterval();
    }
  }

  private blinkFilledRows(filledRowAnimationShapes: Graphics[], debugClear = false): void {
    const count = debugClear ? 1 : TETRIS_CONFIG.linesBlinkCount;

    for (let i = 0; i < count; i++) {
      const timer = Timeout.call(TETRIS_CONFIG.linesBlinkTime * i, () => {
        filledRowAnimationShapes.forEach((filledRowAnimationShape) => this.blinkFilledRow(filledRowAnimationShape));
      });

      this.linesBlinkTimers[i] = timer;
    }
  }

  private blinkFilledRow(filledRowAnimationShape: Graphics): void {
    this.blinkRowShowTimer = Timeout.call(TETRIS_CONFIG.linesBlinkTime * 0.5, () => {
      filledRowAnimationShape.visible = true;
    });

    this.blinkRowHideTimer = Timeout.call(TETRIS_CONFIG.linesBlinkTime, () => {
      filledRowAnimationShape.visible = false;
    });
  }

  private afterFilledRowsAnimation(filledRows: boolean[], debugClear = false): void {
    this.removeRowAndMoveRowsDown(filledRows);
    this.afterShapePlaced(debugClear);
  }

  private removeRowAndMoveRowsDown(filledRows: boolean[]): void {
    for (let row = 0; row < filledRows.length; row++) {
      if (filledRows[row]) {
        this.removeRow(row);
        this.moveRowsDown(row);
      }
    }
  }

  private hideUsedFilledRowAnimationShape(usedFilledRowAnimationShape: Graphics[]): void {
    for (let i = 0; i < usedFilledRowAnimationShape.length; i++) {
      usedFilledRowAnimationShape[i].visible = false;
      this.filledRowAnimationShapes.push(usedFilledRowAnimationShape[i]);
    }
  }

  private afterShapePlaced(debugClear: boolean = false): void {
    this.score += this.scoreForFallFast;
    this.scoreForFallFast = 0;
    this.events.emit('onScoreChange', this.score);

    if (!debugClear) {
      this.spawnShape(this.nextShapeType!);
      this.nextShapeType = this.getRandomShapeType();
      this.events.emit('onChangedNextShape', this.nextShapeType);
    }

    this.shapeFallInterval = this.calculateFallInterval();
    this.fieldMapContainer.cacheAsTexture(true);
  }

  private removeRow(row: number): void {
    for (let column = 0; column < this.fieldMap[0].length; column++) {
      const block = this.fieldMap[row][column];
      this.fieldMapContainer.removeChild(block);
      this.fieldMap[row][column] = null;
    }
  }

  private moveRowsDown(row: number): void {
    for (let i = row; i > 0; i--) {
      for (let column = 0; column < this.fieldMap[0].length; column++) {
        this.fieldMap[i][column] = this.fieldMap[i - 1][column];

        const block = this.fieldMap[i][column];

        if (block !== null) {
          block.y += TETRIS_CONFIG.blockSize;
        }
      }
    }

    for (let column = 0; column < this.fieldMap[0].length; column++) {
      this.fieldMap[0][column] = null;
    }
  }

  private onRotateClockwise(): void {
    if (this.currentShape === null || this.currentShape.getType() === SHAPE_TYPE.O) {
      return;
    }

    this.currentRotateType = ROTATE_TYPE.Clockwise;
    this.rotateShapeClockwise();
  }

  private onRotateCounterClockwise(): void {
    if (this.currentShape === null || this.currentShape.getType() === SHAPE_TYPE.O) {
      return;
    }

    this.currentRotateType = ROTATE_TYPE.CounterClockwise;
    this.rotateShapeCounterClockwise();
  }

  private rotateShapeClockwise(): void {
    if (this.currentShape) {
      this.currentShape.rotate(ROTATE_TYPE.Clockwise);
      const check = this.checkIfShapeCanBeRotated(ROTATE_TYPE.Clockwise);

      if (check && this.currentRotateType === ROTATE_TYPE.Clockwise) {
        GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.RotateShape);
      }
    }
  }

  private rotateShapeCounterClockwise(): void {
    if (this.currentShape) {
      this.currentShape.rotate(ROTATE_TYPE.CounterClockwise);
      const check = this.checkIfShapeCanBeRotated(ROTATE_TYPE.CounterClockwise);

      if (check && this.currentRotateType === ROTATE_TYPE.CounterClockwise) {
        GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.RotateShape);
      }
    }
  }

  private checkIfShapeCanBeRotated(rotateType: ROTATE_TYPE): boolean {
    if (!this.currentShape) return false;

    const shapePosition = this.currentShape.getBlockPosition();
    const shapeBlocksView = this.currentShape.getBlocksView();
    const pivot = this.currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock !== null) {
          const checkEdgeAndField = (shapePosition.x - pivot.x + column < 0)
            || (shapePosition.x - pivot.x + column > TETRIS_CONFIG.field.width - 1)
            || (shapePosition.y - pivot.y + row < 0)
            || (shapePosition.y - pivot.y + row > TETRIS_CONFIG.field.height - 1)
            || (this.fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column] !== null);

          const checkEdge = (shapePosition.x - pivot.x + column < 0)
            || (shapePosition.x - pivot.x + column > TETRIS_CONFIG.field.width - 1)
            || (shapePosition.y - pivot.y + row < 0)
            || (shapePosition.y - pivot.y + row > TETRIS_CONFIG.field.height - 1);

          const isInvisibleShape = this.currentShape.getType() === SHAPE_TYPE.Invisible;
          const check = isInvisibleShape ? checkEdge : checkEdgeAndField;

          if (check) {
            if (rotateType === ROTATE_TYPE.Clockwise) {
              this.rotateShapeCounterClockwise();
            } else {
              this.rotateShapeClockwise();
            }

            return false;
          }
        }
      }
    }

    return true;
  }

  private removeCurrentShape(): void {
    if (this.currentShape) {
      this.removeChild(this.currentShape);
      this.currentShape = null;
    }
  }

  private addShapeToFieldMap(): void {
    this.fieldMapContainer.cacheAsTexture(true);

    const shapePosition = this.currentShape.getBlockPosition();
    const shapeBlocksView = this.currentShape.getBlocksView();
    const pivot = this.currentShape.getPivot();

    for (let row = 0; row < shapeBlocksView.length; row++) {
      for (let column = 0; column < shapeBlocksView[0].length; column++) {
        const shapeBlock = shapeBlocksView[row][column];

        if (shapeBlock !== null) {
          const newBlock = this.createBlockCopy(shapeBlock);
          const oldBlock = this.fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column];

          if (oldBlock !== null) {
            this.fieldMapContainer.removeChild(oldBlock);
          }

          this.fieldMap[shapePosition.y - pivot.y + row][shapePosition.x - pivot.x + column] = newBlock;
          this.fieldMapContainer.addChild(newBlock);

          newBlock.x = (shapePosition.x - pivot.x + column) * TETRIS_CONFIG.blockSize;
          newBlock.y = (shapePosition.y - pivot.y + row) * TETRIS_CONFIG.blockSize;

          this.updateBlockRotation(newBlock, shapeBlock);
        }
      }
    }
  }

  private createBlockCopy(block: Sprite): Sprite {
    const blockCopy = new Sprite(block.texture);
    blockCopy.tint = block.tint;

    return blockCopy;
  }

  private updateBlockRotation(newBlock: Sprite, shapeBlock: Sprite): void {
    if (this.currentShape.getType() === SHAPE_TYPE.I) {
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

  private getRandomShapeType(): SHAPE_TYPE {
    const standardShapeTypes: SHAPE_TYPE[] = [
      SHAPE_TYPE.I,
      SHAPE_TYPE.J,
      SHAPE_TYPE.L,
      SHAPE_TYPE.O,
      SHAPE_TYPE.S,
      SHAPE_TYPE.T,
      SHAPE_TYPE.Z,
    ];

    const shapeTypes: SHAPE_TYPE[] = TETRIS_CONFIG.allowInvisibleShape ? [...standardShapeTypes, SHAPE_TYPE.Invisible] : [...standardShapeTypes];
    const randomIndex: number = Math.floor(Math.random() * shapeTypes.length);

    return shapeTypes[randomIndex];
  }

  private calculateFallInterval(): number {
    const level: number = this.currentLevel > LEVELS_CONFIG.length - 1 ? LEVELS_CONFIG.length - 1 : this.currentLevel;

    const framesPerRow: number = LEVELS_CONFIG[level].framesPerRow;
    return framesPerRow / TETRIS_CONFIG.originalTetrisFramesPerSecond * 1000;
  }

  private getTowerHeight(): number {
    let towerLinesCount: number = 0;

    for (let row = 0; row < TETRIS_CONFIG.field.height; row++) {
      let isTowerLine: boolean = false;

      for (let column = 0; column < TETRIS_CONFIG.field.width; column++) {
        if (this.fieldMap[row][column] !== null) {
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

  private init(): void {
    this.position = TETRIS_CONFIG.field.position;

    this.initFieldMapContainer();
    this.initFieldMap();
    this.initFilledRowAnimationShapes();
  }

  private initFieldMapContainer(): void {
    this.fieldMapContainer = new Container();
    this.addChild(this.fieldMapContainer);
  }

  private initFieldMap(): void {
    for (let row = 0; row < TETRIS_CONFIG.field.height; row++) {
      this.fieldMap[row] = [];

      for (let column = 0; column < TETRIS_CONFIG.field.width; column++) {
        this.fieldMap[row][column] = null;
      }
    }
  }

  private initFilledRowAnimationShapes(): void {
    const filledRowsAnimationShapeCount = 4;

    for (let i = 0; i < filledRowsAnimationShapeCount; i++) {
      const filledRowAnimationShape = new Graphics();

      filledRowAnimationShape.rect(0, 0, TETRIS_CONFIG.field.width * TETRIS_CONFIG.blockSize, TETRIS_CONFIG.blockSize);
      filledRowAnimationShape.fill(0x686f4a);

      filledRowAnimationShape.visible = false;

      this.addChild(filledRowAnimationShape);
      this.filledRowAnimationShapes.push(filledRowAnimationShape);
    }
  }

  private spawnShape(shapeType: SHAPE_TYPE): void {
    const shape = this.currentShape = new Shape(shapeType);
    this.addChild(shape);

    const spawnPosition = TETRIS_CONFIG.shapeSpawnPosition;
    shape.setPosition(spawnPosition.x, spawnPosition.y);
  }

  private clearFieldMap(): void {
    this.fieldMapContainer.cacheAsTexture(true);

    for (let row = 0; row < this.fieldMap.length; row++) {
      for (let column = 0; column < this.fieldMap[0].length; column++) {
        const block = this.fieldMap[row][column];

        if (block !== null) {
          this.fieldMapContainer.removeChild(block);
          this.fieldMap[row][column] = null;
        }
      }
    }

    this.fieldMapContainer.cacheAsTexture(true);
  }
}
