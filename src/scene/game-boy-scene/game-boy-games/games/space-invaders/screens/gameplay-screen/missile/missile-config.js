const MISSILE_TYPE = {
  Player: 'PLAYER',
  Electric: 'ELECTRIC',
}

const MISSILES_CONFIG = {
  [MISSILE_TYPE.Player]: {
    textures: [
      'ui_assets/space-invaders/player-missile',
    ],
    speed: 2,
  },
  [MISSILE_TYPE.Electric]: {
    textures: [
      'ui_assets/space-invaders/enemy-missile-electric-01',
      'ui_assets/space-invaders/enemy-missile-electric-02',
      'ui_assets/space-invaders/enemy-missile-electric-03',
      'ui_assets/space-invaders/enemy-missile-electric-04',
    ],
    speed: 1,
  },
}

export {
  MISSILE_TYPE,
  MISSILES_CONFIG,
};
