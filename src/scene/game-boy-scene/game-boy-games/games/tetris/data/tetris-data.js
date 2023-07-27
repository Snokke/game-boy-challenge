const SCREEN_TYPE = {
  License: 'LICENSE',
  Title: 'TITLE',
  Gameplay: 'GAMEPLAY',
}

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

export {
  SCREEN_TYPE,
  SHAPE_TYPE,
  SHAPE_DIRECTION,
  DIRECTION_SEQUENCE,
  ROTATE_TYPE
};
