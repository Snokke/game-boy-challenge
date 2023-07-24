import * as THREE from 'three';
import { GAME_TYPE } from '../../games/data/games-config';

const CARTRIDGES_CONFIG = {
  startPosition: new THREE.Vector3(-3, 0, 0),
  offset: new THREE.Vector3(0, 0.5, -0.3),
}

const CARTRIDGE_TYPE = {
  Tetris: 'TETRIS',
  Zelda: 'ZELDA',
  DuckTales: 'DUCK_TALES',
}

const CARTRIDGES_BY_TYPE_CONFIG = {
  [CARTRIDGE_TYPE.Tetris]: {
    textureName: 'baked-cartridge-tetris',
    game: GAME_TYPE.Tetris,
  },
  [CARTRIDGE_TYPE.Zelda]: {
    textureName: 'baked-cartridge-zelda',
    game: GAME_TYPE.Zelda,
  },
  [CARTRIDGE_TYPE.DuckTales]: {
    textureName: 'baked-cartridge-ducktales',
    game: GAME_TYPE.DuckTales,
  },
}

export { CARTRIDGES_CONFIG, CARTRIDGES_BY_TYPE_CONFIG, CARTRIDGE_TYPE };
