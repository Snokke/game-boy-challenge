import * as PIXI from 'pixi.js';
import { GAME_BOY_CONFIG } from '../../../../../../../game-boy/data/game-boy-config';

const SHAPE_TYPE = {
  I: 'I',
  J: 'J',
  L: 'L',
  O: 'O',
  S: 'S',
  T: 'T',
  Z: 'Z',
  Invisible: 'INVISIBLE',
}

const SHAPE_DIRECTION = {
  Up: 'UP',
  Right: 'RIGHT',
  Down: 'DOWN',
  Left: 'LEFT',
}

const DIRECTION_SEQUENCE = [
  SHAPE_DIRECTION.Up,
  SHAPE_DIRECTION.Right,
  SHAPE_DIRECTION.Down,
  SHAPE_DIRECTION.Left,
];

const ROTATE_TYPE = {
  Clockwise: 'CLOCKWISE',
  CounterClockwise: 'COUNTER_CLOCKWISE',
}

const SHAPE_CONFIG = {
  [SHAPE_TYPE.I]: {
    textureEdge: 'ui_assets/tetris/block-i-edge',
    textureMiddle: 'ui_assets/tetris/block-i-middle',
    tint: GAME_BOY_CONFIG.screen.tint,
    blocksView: [
      [1, 1, 1, 1],
    ],
    pivot: new PIXI.Point(1, 0),
    availableDirections: [
      SHAPE_DIRECTION.Up,
      SHAPE_DIRECTION.Left,
    ],
  },
  [SHAPE_TYPE.J]: {
    texture: 'ui_assets/tetris/block-j',
    tint: GAME_BOY_CONFIG.screen.tint,
    blocksView: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    pivot: new PIXI.Point(1, 0),
    availableDirections: [
      SHAPE_DIRECTION.Up,
      SHAPE_DIRECTION.Right,
      SHAPE_DIRECTION.Down,
      SHAPE_DIRECTION.Left,
    ],
  },
  [SHAPE_TYPE.L]: {
    texture: 'ui_assets/tetris/block-l',
    tint: GAME_BOY_CONFIG.screen.tint,
    blocksView: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    pivot: new PIXI.Point(1, 0),
    availableDirections: [
      SHAPE_DIRECTION.Up,
      SHAPE_DIRECTION.Right,
      SHAPE_DIRECTION.Down,
      SHAPE_DIRECTION.Left,
    ],
  },
  [SHAPE_TYPE.O]: {
    texture: 'ui_assets/tetris/block-o',
    tint: GAME_BOY_CONFIG.screen.tint,
    blocksView: [
      [1, 1],
      [1, 1],
    ],
    pivot: new PIXI.Point(0, 0),
    availableDirections: [],
  },
  [SHAPE_TYPE.S]: {
    texture: 'ui_assets/tetris/block-s',
    tint: GAME_BOY_CONFIG.screen.tint,
    blocksView: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    pivot: new PIXI.Point(1, 0),
    availableDirections: [
      SHAPE_DIRECTION.Up,
      SHAPE_DIRECTION.Right,
    ],
  },
  [SHAPE_TYPE.T]: {
    texture: 'ui_assets/tetris/block-t',
    tint: GAME_BOY_CONFIG.screen.tint,
    blocksView: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    pivot: new PIXI.Point(1, 0),
    availableDirections: [
      SHAPE_DIRECTION.Up,
      SHAPE_DIRECTION.Right,
      SHAPE_DIRECTION.Down,
      SHAPE_DIRECTION.Left,
    ],
  },
  [SHAPE_TYPE.Z]: {
    texture: 'ui_assets/tetris/block-z',
    tint: GAME_BOY_CONFIG.screen.tint,
    blocksView: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    pivot: new PIXI.Point(1, 0),
    availableDirections: [
      SHAPE_DIRECTION.Up,
      SHAPE_DIRECTION.Right,
    ],
  },
  [SHAPE_TYPE.Invisible]: {
    texture: 'ui_assets/tetris/block-o',
    tint: '#ec8976',
    blocksView: [
      [1, 1, 1],
    ],
    pivot: new PIXI.Point(1, 0),
    availableDirections: [
      SHAPE_DIRECTION.Up,
      SHAPE_DIRECTION.Right,
      SHAPE_DIRECTION.Down,
      SHAPE_DIRECTION.Left,
    ],
  },
}

export {
  SHAPE_TYPE,
  SHAPE_DIRECTION,
  DIRECTION_SEQUENCE,
  ROTATE_TYPE,
  SHAPE_CONFIG,
};
