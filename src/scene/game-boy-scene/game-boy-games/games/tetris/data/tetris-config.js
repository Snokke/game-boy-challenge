import * as PIXI from 'pixi.js';
import { CARTRIDGE_STATE } from '../../../../game-boy/data/game-boy-data';

const TETRIS_CONFIG = {
  cartridgeState: CARTRIDGE_STATE.NotInserted,
  startLevel: 0,
  field: {
    width: 10,
    height: 20,
    position: new PIXI.Point(16, -16),
  },
  blockSize: 8,
  shapeSpawnPosition: new PIXI.Point(4, 3),
  linesBlinkTime: 300,
  linesBlinkCount: 3,
  fastFallInterval: 30,
  originalTetrisFramesPerSecond: 59.73,
  scorePerLine: [40, 100, 300, 1200],
  scoreForSoftDrop: 1,
  bestScore: 0,
  isMusicAllowed: true,
  allowInvisibleShape: true,
}

const LEVELS_CONFIG = [
  { framesPerRow: 53 }, // 0
  { framesPerRow: 49 }, // 1
  { framesPerRow: 45 }, // 2
  { framesPerRow: 41 }, // 3
  { framesPerRow: 37 }, // 4
  { framesPerRow: 33 }, // 5
  { framesPerRow: 28 }, // 6
  { framesPerRow: 22 }, // 7
  { framesPerRow: 17 }, // 8
  { framesPerRow: 11 }, // 9
  { framesPerRow: 10 }, // 10
  { framesPerRow: 9 }, // 11
  { framesPerRow: 8 }, // 12
  { framesPerRow: 7 }, // 13
  { framesPerRow: 6 }, // 14
  { framesPerRow: 6 }, // 15
  { framesPerRow: 5 }, // 16
  { framesPerRow: 5 }, // 17
  { framesPerRow: 4 }, // 18
  { framesPerRow: 4 }, // 19
  { framesPerRow: 3 }, // 20
]

export {
  TETRIS_CONFIG,
  LEVELS_CONFIG,
};
