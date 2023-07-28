import * as THREE from 'three';
import { GAME_TYPE } from '../../game-boy-games/data/games-config';

const CARTRIDGE_TYPE = {
  Tetris: 'TETRIS',
  Zelda: 'ZELDA',
  DuckTales: 'DUCK_TALES',
}

const CARTRIDGES_CONFIG = {
  movingSpeed: 5,
  positions: {
    insert: {
      middle: new THREE.Vector3(-2.6, 3.6, 0.7),
      beforeInsert: new THREE.Vector3(0, 2.8, -0.28),
      slot: new THREE.Vector3(0, 1.03, -0.28),
    },
    eject: {
      beforeEject: new THREE.Vector3(0, 2.8, -0.28),
      middle: new THREE.Vector3(-2.2, 3.5, 0.5),
    }
  },
  floating: {
    [CARTRIDGE_TYPE.Tetris]: {
      startPosition: new THREE.Vector3(-2.8, -1, 0.7),
      rotation: new THREE.Vector3(0, 5, 2),
      amplitude: 0.05,
      speed: 0.3,
      startTime: 0,
    },
    [CARTRIDGE_TYPE.Zelda]: {
      startPosition: new THREE.Vector3(-3.3, 0.1, 0.2),
      rotation: new THREE.Vector3(-3, 0, -1),
      amplitude: 0.03,
      speed: 0.4,
      startTime: 2,
    },
    [CARTRIDGE_TYPE.DuckTales]: {
      startPosition: new THREE.Vector3(-2.7, 1.2, -0.3),
      rotation: new THREE.Vector3(0, -5, -2),
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
