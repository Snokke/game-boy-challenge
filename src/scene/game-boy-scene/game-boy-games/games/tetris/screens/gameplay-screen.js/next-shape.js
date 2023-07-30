import * as PIXI from 'pixi.js';
import { TETRIS_CONFIG } from '../../data/tetris-config';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import { SHAPE_CONFIG, SHAPE_TYPE } from './field/shape/shape-config';

export default class NextShape extends PIXI.Container {
  constructor(type) {
    super();

    this._type = type;
    this._blocksView = [];
    this._shapePivot = null;

    this._width = 0;
    this._height = 0;

    this._init();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  _init() {
    if (this._type === SHAPE_TYPE.I) {
      this._initShapeI();
    } else {
      this._initShape();
    }

    this.cacheAsBitmap = true;
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

    this._height = this._blocksView.length * TETRIS_CONFIG.blockSize + 16;
    this._width = this._blocksView[0].length * TETRIS_CONFIG.blockSize - 16;
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

    this._height = this._blocksView.length * TETRIS_CONFIG.blockSize;
    this._width = this._blocksView[0].length * TETRIS_CONFIG.blockSize;
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
          block.rotation = 0;
          block.x = (column - this._shapePivot.x) * TETRIS_CONFIG.blockSize;
          block.y = (row - this._shapePivot.y) * TETRIS_CONFIG.blockSize;

          if (column === this._blocksView[0].length - 1) {
            block.rotation = Math.PI;
            block.x += 1 * TETRIS_CONFIG.blockSize;
            block.y += 1 * TETRIS_CONFIG.blockSize;
          }

          index += 1;
        }
      }
    }
  }
}
