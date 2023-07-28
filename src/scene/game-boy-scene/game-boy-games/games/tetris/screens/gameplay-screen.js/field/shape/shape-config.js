import * as PIXI from 'pixi.js';

const SHAPE_TYPE = {
  I: 'I',
  J: 'J',
  L: 'L',
  O: 'O',
  S: 'S',
  T: 'T',
  Z: 'Z',
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
    blocksView: [
      [1, 1],
      [1, 1],
    ],
    pivot: new PIXI.Point(0, 0),
    availableDirections: [],
  },
  [SHAPE_TYPE.S]: {
    texture: 'ui_assets/tetris/block-s',
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
}

export {
  SHAPE_TYPE,
  SHAPE_DIRECTION,
  DIRECTION_SEQUENCE,
  ROTATE_TYPE,
  SHAPE_CONFIG,
};
