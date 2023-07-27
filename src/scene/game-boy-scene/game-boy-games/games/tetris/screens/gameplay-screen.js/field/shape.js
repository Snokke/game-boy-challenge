import * as PIXI from 'pixi.js';
import { SHAPE_CONFIG, TETRIS_CONFIG } from '../../../data/tetris-config';
import Loader from '../../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../../game-boy/data/game-boy-config';

export default class Shape extends PIXI.Container {
  constructor(type) {
    super();

    this._type = type;
    this._blocksView = null;

    this._blockPosition = new PIXI.Point(0, 0);

    this._init();
  }

  setPosition(x, y) {
    // this.x = x * TETRIS_CONFIG.blockSize;
    // this.y = y * TETRIS_CONFIG.blockSize;
  }

  moveRight() {
    this.x += TETRIS_CONFIG.blockSize;
    this._blockPosition.x++;
  }

  moveLeft() {
    this.x -= TETRIS_CONFIG.blockSize;
    this._blockPosition.x--;
  }

  getBlockPosition() {
    return this._blockPosition;
  }

  getBlocksView() {
    return this._blocksView;
  }

  rotateClockwise() {
    if (this._type === 'O') {
      return;
    }

    const blocksView = SHAPE_CONFIG[this._type].blocksView;
    const newBlocksView = [];

    for (let row = 0; row < blocksView.length; row++) {
      newBlocksView.push([]);

      for (let column = 0; column < blocksView[0].length; column++) {
        newBlocksView[row].push(blocksView[blocksView.length - column - 1][row]);
      }
    }

    const newBlocksViewWidth = newBlocksView[0].length;
    const newBlocksViewHeight = newBlocksView.length;

    const newBlocksViewX = Math.floor((newBlocksViewWidth - blocksView[0].length) / 2);
    const newBlocksViewY = Math.floor((newBlocksViewHeight - blocksView.length) / 2);

    for (let row = 0; row < newBlocksView.length; row++) {
      for (let column = 0; column < newBlocksView[0].length; column++) {
        if (newBlocksView[row][column] === 1) {
          const block = this.getChildAt(row * newBlocksViewWidth + column);

          block.x = (column - newBlocksViewX) * TETRIS_CONFIG.blockSize;
          block.y = (row - newBlocksViewY) * TETRIS_CONFIG.blockSize;
        }
      }
    }

    this._blocksView = newBlocksView;
  }

  rotateCounterClockwise() {

  }

  _init() {
    const config = SHAPE_CONFIG[this._type];
    const blockTexture = Loader.assets[config.texture];
    const blocksView = this._blocksView = config.blocksView;

    for (let row = 0; row < blocksView.length; row++) {
      for (let column = 0; column < blocksView[0].length; column++) {
        if (blocksView[row][column] === 1) {
          const block = new PIXI.Sprite(blockTexture);
          this.addChild(block);

          block.tint = GAME_BOY_CONFIG.screen.tint;

          block.x = column * TETRIS_CONFIG.blockSize;
          block.y = row * TETRIS_CONFIG.blockSize;
        }
      }
    }
  }
}
