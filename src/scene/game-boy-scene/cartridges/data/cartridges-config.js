import * as THREE from 'three';
import { GAME_TYPE } from '../../game-boy-games/data/games-config';

const CARTRIDGE_TYPE = {
  Tetris: 'TETRIS',
  Zelda: 'ZELDA',
  DuckTales: 'DUCK_TALES',
}

const CARTRIDGES_CONFIG = {
  startPosition: new THREE.Vector3(-3, 0, 0),
  offset: new THREE.Vector3(0, 0.5, -0.3),
  floating: {
    [CARTRIDGE_TYPE.Tetris]: {
      amplitude: 0.05,
      speed: 0.3,
      startTime: 0,
    },
    [CARTRIDGE_TYPE.Zelda]: {
      amplitude: 0.03,
      speed: 0.4,
      startTime: 2,
    },
    [CARTRIDGE_TYPE.DuckTales]: {
      amplitude: 0.04,
      speed: 0.5,
      startTime: 3,
    },
  }
}

const CARTRIDGES_BY_TYPE_CONFIG = {
  [CARTRIDGE_TYPE.Tetris]: {
    labelTexture: 'baked-cartridge-tetris',
    game: GAME_TYPE.Tetris,
  },
  [CARTRIDGE_TYPE.Zelda]: {
    labelTexture: 'baked-cartridge-zelda',
    game: GAME_TYPE.Zelda,
  },
  [CARTRIDGE_TYPE.DuckTales]: {
    labelTexture: 'baked-cartridge-ducktales',
    game: GAME_TYPE.DuckTales,
  },
}

export {
  CARTRIDGES_CONFIG,
  CARTRIDGES_BY_TYPE_CONFIG,
  CARTRIDGE_TYPE,
};
