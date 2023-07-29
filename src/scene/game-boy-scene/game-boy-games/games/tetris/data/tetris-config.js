import * as PIXI from 'pixi.js';
import { LEVEL_TYPE } from "./tetris-data";

const TETRIS_CONFIG = {
  field: {
    width: 10,
    height: 18,
    position: new PIXI.Point(16, 0),
  },
  blockSize: 8,
  shapeSpawnPosition: new PIXI.Point(4, 1),
}

const LEVELS_CONFIG = {
  [LEVEL_TYPE.Level01]: {
    fallInterval: 1000,
  },
  [LEVEL_TYPE.Level02]: {
    fallInterval: 900,
  },
  [LEVEL_TYPE.Level03]: {
    fallInterval: 800,
  },
}

export {
  TETRIS_CONFIG,
  LEVELS_CONFIG,
};
