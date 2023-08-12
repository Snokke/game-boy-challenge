import * as PIXI from 'pixi.js';

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
    textureEdge: 'block-i-edge.png',
    textureMiddle: 'block-i-middle.png',
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
    texture: 'block-j.png',
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
    texture: 'block-l.png',
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
    texture: 'block-o.png',
    blocksView: [
      [1, 1],
      [1, 1],
    ],
    pivot: new PIXI.Point(0, 0),
    availableDirections: [],
  },
  [SHAPE_TYPE.S]: {
    texture: 'block-s.png',
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
    texture: 'block-t.png',
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
    texture: 'block-z.png',
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
    texture: 'block-o.png',
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
