import * as THREE from 'three';
import { GAME_TYPE } from '../../game-boy-games/data/games-config';

enum CARTRIDGE_TYPE {
  Tetris = 'TETRIS',
  Zelda = 'ZELDA',
  SpaceInvaders = 'SPACE_INVADERS',
}

const CARTRIDGES_CONFIG = {
  positions: {
    insert: {
      middle: new THREE.Vector3(-2.6, 3.6, 1.2),
      beforeInsert: new THREE.Vector3(0, 2.8, -0.28),
      slot: new THREE.Vector3(0, 1.03, -0.28),
    },
    eject: {
      beforeEject: new THREE.Vector3(0, 2.8, -0.28),
      middle: new THREE.Vector3(-2.2, 3.5, -0.3),
    }
  },
  floating: {
    [CARTRIDGE_TYPE.Tetris]: {
      startPosition: new THREE.Vector3(-2.8, -1, 0.7),
      rotation: new THREE.Vector3(0, 5, 2),
      amplitude: 0.05,
      speed: 0.3,
    },
    [CARTRIDGE_TYPE.Zelda]: {
      startPosition: new THREE.Vector3(-3.3, 0.1, 0.2),
      rotation: new THREE.Vector3(-3, 0, -1),
      amplitude: 0.03,
      speed: 0.4,
    },
    [CARTRIDGE_TYPE.SpaceInvaders]: {
      startPosition: new THREE.Vector3(-2.7, 1.2, -0.3),
      rotation: new THREE.Vector3(0, -5, -2),
      amplitude: 0.04,
      speed: 0.5,
    },
  }
}

const CARTRIDGES_BY_TYPE_CONFIG = {
  [CARTRIDGE_TYPE.Tetris]: {
    texture: 'baked-cartridge-tetris',
    textureInPocket: 'baked-cartridge-tetris-in-pocket',
    game: GAME_TYPE.Tetris,
  },
  [CARTRIDGE_TYPE.Zelda]: {
    texture: 'baked-cartridge-zelda',
    textureInPocket: 'baked-cartridge-zelda-in-pocket',
    game: GAME_TYPE.Zelda,
  },
  [CARTRIDGE_TYPE.SpaceInvaders]: {
    texture: 'baked-cartridge-space-invaders',
    textureInPocket: 'baked-cartridge-space-invaders-in-pocket',
    game: GAME_TYPE.SpaceInvaders,
  },
}

export {
  CARTRIDGES_CONFIG,
  CARTRIDGES_BY_TYPE_CONFIG,
  CARTRIDGE_TYPE,
};
