const MISSILE_TYPE = {
  Player: 'PLAYER',
  Electric: 'ELECTRIC',
}

const MISSILES_CONFIG = {
  [MISSILE_TYPE.Player]: {
    textures: [
      'player-missile.png',
    ],
    speed: 2,
  },
  [MISSILE_TYPE.Electric]: {
    textures: [
      'enemy-missile-electric-01.png',
      'enemy-missile-electric-02.png',
      'enemy-missile-electric-03.png',
      'enemy-missile-electric-04.png',
    ],
    speed: 1,
  },
}

export {
  MISSILE_TYPE,
  MISSILES_CONFIG,
};
