import * as PIXI from 'pixi.js';
import { TETRIS_CONFIG } from '../../../../data/tetris-config';
import Loader from '../../../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../../../game-boy/data/game-boy-config';
import { DIRECTION_SEQUENCE, ROTATE_TYPE, SHAPE_CONFIG, SHAPE_DIRECTION, SHAPE_TYPE } from './shape-config';

export default class Shape extends PIXI.Container {
  constructor(type) {
    super();

    this._type = type;
    this._blocksView = [];
    this._shapePivot = null;
    this._direction = SHAPE_DIRECTION.Up;
    this._blockPosition = new PIXI.Point(0, 0);
    this._distanceFallen = 0;

    this._init();
  }

  setPosition(x, y) {
    this._blockPosition.set(x, y);

    this.x = this._blockPosition.x * TETRIS_CONFIG.blockSize;
    this.y = this._blockPosition.y * TETRIS_CONFIG.blockSize;
  }

  moveRight() {
    this.x += TETRIS_CONFIG.blockSize;
    this._blockPosition.x += 1;
  }

  moveLeft() {
    this.x -= TETRIS_CONFIG.blockSize;
    this._blockPosition.x -= 1;
  }

  moveDown() {
    this.y += TETRIS_CONFIG.blockSize;
    this._blockPosition.y += 1;

    this._distanceFallen += 1;
  }

  getBlockPosition() {
    return this._blockPosition;
  }

  getBlocksView() {
    return this._blocksView;
  }

  getPivot() {
    return this._shapePivot;
  }

  getType() {
    return this._type;
  }

  getFallenDistance() {
    return this._distanceFallen;
  }

  rotate(rotateType) {
    if (SHAPE_CONFIG[this._type].availableDirections.length === 0) {
      return;
    }

    if (rotateType === ROTATE_TYPE.Clockwise) {
      this._rotateClockwise();
    } else {
      this._rotateCounterClockwise();
    }

    if (this._type === SHAPE_TYPE.I) {
      this._updateShapeIBlocksPosition();
    } else {
      this._updateShapeBlocksPosition();
    }
  }

  _rotateClockwise() {
    const blocksView = this._blocksView;
    const newBlocksView = [];

    for (let row = 0; row < blocksView[0].length; row++) {
      newBlocksView.push([]);

      for (let column = 0; column < blocksView.length; column++) {
        newBlocksView[row][column] = blocksView[blocksView.length - column - 1][row];
      }
    }

    this._blocksView = newBlocksView;
    this._shapePivot = new PIXI.Point(this._blocksView[0].length - this._shapePivot.y - 1, this._shapePivot.x);

    const availableDirections = SHAPE_CONFIG[this._type].availableDirections;
    this._direction = this._getNextDirection();

    if (!availableDirections.includes(this._direction)) {
      this._rotateClockwise();
    }
  }

  _rotateCounterClockwise() {
    const blocksView = this._blocksView;
    const newBlocksView = [];

    for (let row = 0; row < blocksView[0].length; row++) {
      newBlocksView.push([]);

      for (let column = 0; column < blocksView.length; column++) {
        newBlocksView[row][column] = blocksView[column][blocksView[0].length - row - 1];
      }
    }

    this._blocksView = newBlocksView;
    this._shapePivot = new PIXI.Point(this._shapePivot.y, this._blocksView.length - this._shapePivot.x - 1);

    const availableDirections = SHAPE_CONFIG[this._type].availableDirections;
    this._direction = this._getPreviousDirection();

    if (!availableDirections.includes(this._direction)) {
      this._rotateCounterClockwise();
    }
  }

  _getNextDirection() {
    let newDirection;

    for (let i = 0; i < DIRECTION_SEQUENCE.length; i += 1) {
      if (DIRECTION_SEQUENCE[i] === this._direction) {
        if (i === DIRECTION_SEQUENCE.length - 1) {
          newDirection = DIRECTION_SEQUENCE[0];
        } else {
          newDirection = DIRECTION_SEQUENCE[i + 1];
        }

        break;
      }
    }

    return newDirection;
  }

  _getPreviousDirection() {
    let newDirection;

    for (let i = 0; i < DIRECTION_SEQUENCE.length; i += 1) {
      if (DIRECTION_SEQUENCE[i] === this._direction) {
        if (i === 0) {
          newDirection = DIRECTION_SEQUENCE[DIRECTION_SEQUENCE.length - 1];
        } else {
          newDirection = DIRECTION_SEQUENCE[i - 1];
        }

        break;
      }
    }

    return newDirection;
  }

  _init() {
    if (this._type === SHAPE_TYPE.I) {
      this._initShapeI();
    } else {
      this._initShape();
    }
  }

  _initShapeI() {
    const config = SHAPE_CONFIG[this._type];
    const blocksView = config.blocksView;

    const blockTexture = Loader.assets[config.textureMiddle];
    const edgeTexture = Loader.assets[config.textureEdge];

    for (let row = 0; row < blocksView.length; row++) {
      this._blocksView[row] = [];

      for (let column = 0; column < blocksView[0].length; column++) {
        if (blocksView[row][column] === 1) {
          const texture = (column === 0 || column === blocksView[0].length - 1) ? edgeTexture : blockTexture;
          const block = new PIXI.Sprite(texture);
          this.addChild(block);

          block.tint = GAME_BOY_CONFIG.screen.tint;
          this._blocksView[row][column] = block;
        } else {
          this._blocksView[row][column] = null;
        }
      }
    }

    this._shapePivot = config.pivot;
    this._updateShapeIBlocksPosition();
  }

  _initShape() {
    const config = SHAPE_CONFIG[this._type];
    const blocksView = config.blocksView;
    const blockTexture = Loader.assets[config.texture];

    for (let row = 0; row < blocksView.length; row++) {
      this._blocksView[row] = [];

      for (let column = 0; column < blocksView[0].length; column++) {
        if (blocksView[row][column] === 1) {
          const block = new PIXI.Sprite(blockTexture);
          this.addChild(block);

          block.tint = GAME_BOY_CONFIG.screen.tint;
          this._blocksView[row][column] = block;
        } else {
          this._blocksView[row][column] = null;
        }
      }
    }

    this._shapePivot = config.pivot;
    this._updateShapeBlocksPosition();
  }

  _updateShapeBlocksPosition() {
    let index = 0;

    for (let row = 0; row < this._blocksView.length; row++) {
      for (let column = 0; column < this._blocksView[0].length; column++) {
        const block = this._blocksView[row][column];

        if (block !== null) {
          block.x = (column - this._shapePivot.x) * TETRIS_CONFIG.blockSize;
          block.y = (row - this._shapePivot.y) * TETRIS_CONFIG.blockSize;

          index += 1;
        }
      }
    }
  }

  _updateShapeIBlocksPosition() {
    let index = 0;

    for (let row = 0; row < this._blocksView.length; row++) {
      for (let column = 0; column < this._blocksView[0].length; column++) {
        const block = this._blocksView[row][column];

        if (block !== null) {
          if (this._direction === SHAPE_DIRECTION.Up) {
            block.rotation = 0;
            block.x = (column - this._shapePivot.x) * TETRIS_CONFIG.blockSize;
            block.y = (row - this._shapePivot.y) * TETRIS_CONFIG.blockSize;

            if (column === this._blocksView[0].length - 1) {
              block.rotation = Math.PI;
              block.x += 1 * TETRIS_CONFIG.blockSize;
              block.y += 1 * TETRIS_CONFIG.blockSize;
            }
          }

          if (this._direction === SHAPE_DIRECTION.Left) {
            block.rotation = -Math.PI * 0.5;
            block.x = (column - this._shapePivot.y + 2) * TETRIS_CONFIG.blockSize;
            block.y = (row - this._shapePivot.x - 1) * TETRIS_CONFIG.blockSize;

            if (row === 0) {
              block.rotation = Math.PI * 0.5;
              block.x += 1 * TETRIS_CONFIG.blockSize;
              block.y -= 1 * TETRIS_CONFIG.blockSize;
            }
          }

          index += 1;
        }
      }
    }
  }
}
