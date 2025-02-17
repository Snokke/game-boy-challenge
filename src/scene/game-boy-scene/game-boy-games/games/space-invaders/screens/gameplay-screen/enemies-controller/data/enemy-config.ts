const ENEMY_CONFIG = {
  rows: 5,
  columns: 8,
}

const ENEMY_TYPE = {
  Enemy01: 'Enemy01',
  Enemy02: 'Enemy02',
}

const ENEMIES_CONFIG = {
  [ENEMY_TYPE.Enemy01]: {
    textures: [
      'enemy01-frame01.png',
      'enemy01-frame02.png',
    ],
    score: 10,
  },
  [ENEMY_TYPE.Enemy02]: {
    textures: [
      'enemy01-frame01.png',
      'enemy01-frame02.png',
    ],
    score: 20,
  },
}

enum ENEMY_MOVEMENT_DIRECTION {
  Left = 'LEFT',
  Right = 'RIGHT',
}

export {
  ENEMIES_CONFIG,
  ENEMY_TYPE,
  ENEMY_CONFIG,
  ENEMY_MOVEMENT_DIRECTION,
};
