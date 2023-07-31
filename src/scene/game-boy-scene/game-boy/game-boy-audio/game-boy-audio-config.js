import { GAME_BOY_SOUND_TYPE } from "./game-boy-audio-data";

const GAME_BOY_SOUNDS_CONFIG = {
  [GAME_BOY_SOUND_TYPE.GameBoyLoad]: {
    fileName: 'game-boy-load',
  },
  [GAME_BOY_SOUND_TYPE.TetrisMusic]: {
    fileName: 'tetris-music',
  },
}

export { GAME_BOY_SOUNDS_CONFIG };
