import * as THREE from 'three';

const CARTRIDGES_CONFIG = {
  startPosition: new THREE.Vector3(-3, 0, 0),
  offset: new THREE.Vector3(0, 0.5, -0.3),
}

const CARTRIDGE_TYPE = {
  Tetris: 'TETRIS',
  Zelda: 'ZELDA',
}

const CARTRIDGES_BY_TYPE_CONFIG = {
  [CARTRIDGE_TYPE.Tetris]: {
    textureName: 'cartridge-tetris',
  },
  [CARTRIDGE_TYPE.Zelda]: {
    textureName: 'cartridge-tetris',
  },
}

export { CARTRIDGES_CONFIG, CARTRIDGES_BY_TYPE_CONFIG, CARTRIDGE_TYPE };
