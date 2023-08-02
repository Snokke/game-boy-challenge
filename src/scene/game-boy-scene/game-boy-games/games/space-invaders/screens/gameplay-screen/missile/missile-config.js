const MISSILE_CONFIG = {
  speed: 2,
}

const MISSILE_TYPE = {
  Player: 'PLAYER',
}

const MISSILES_CONFIG = {
  [MISSILE_TYPE.Player]: {
    textures: [
      'ui_assets/space-invaders/player-missile',
    ],
  },
}

export {
  MISSILE_TYPE,
  MISSILES_CONFIG,
  MISSILE_CONFIG,
};
