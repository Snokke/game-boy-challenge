import * as PIXI from 'pixi.js';
import { SHAPE_TYPE } from "./tetris-data";

const TETRIS_CONFIG = {
  field: {
    width: 10,
    height: 18,
    position: new PIXI.Point(16, 0),
  },
  blockSize: 8,
}

const SHAPE_CONFIG = {
  [SHAPE_TYPE.I]: {
    texture: 'ui_assets/tetris/block-i-edge',
    // texture: 'ui_assets/tetris/block-i-middle',
  },
  [SHAPE_TYPE.J]: {
    texture: 'ui_assets/tetris/block-j',
  },
  [SHAPE_TYPE.L]: {
    texture: 'ui_assets/tetris/block-l',
  },
  [SHAPE_TYPE.O]: {
    texture: 'ui_assets/tetris/block-o',
    blocksView: [
      [1, 1],
      [1, 1],
    ],
  },
  [SHAPE_TYPE.S]: {
    texture: 'ui_assets/tetris/block-s',
    blocksView: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  [SHAPE_TYPE.T]: {
    texture: 'ui_assets/tetris/block-t',
  },
  [SHAPE_TYPE.Z]: {
    texture: 'ui_assets/tetris/block-z',
  },
}

export { TETRIS_CONFIG, SHAPE_CONFIG };
