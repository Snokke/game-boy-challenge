import { GAME_BOY_SOUND_TYPE } from "./game-boy-audio-data";

const GAME_BOY_SOUNDS_CONFIG = {
  [GAME_BOY_SOUND_TYPE.GameBoyLoad]: {
    fileName: 'game-boy-load',
    repeat: false,
  },
  [GAME_BOY_SOUND_TYPE.ZeldaIntro]: {
    fileName: 'zelda-intro-sound',
    repeat: false,
  },
  [GAME_BOY_SOUND_TYPE.TetrisMusic]: {
    fileName: 'tetris-music',
    repeat: true,
  },
  [GAME_BOY_SOUND_TYPE.MoveSide]: {
    fileName: 'move-side',
    repeat: false,
  },
  [GAME_BOY_SOUND_TYPE.RotateShape]: {
    fileName: 'rotate-shape',
    repeat: false,
  },
  [GAME_BOY_SOUND_TYPE.ShapeFall]: {
    fileName: 'shape-fall',
    repeat: false,
  },
  [GAME_BOY_SOUND_TYPE.LineClear]: {
    fileName: 'line-clear',
    repeat: false,
  },
  [GAME_BOY_SOUND_TYPE.TetrisPause]: {
    fileName: 'tetris-pause',
    repeat: false,
  },
  [GAME_BOY_SOUND_TYPE.TetrisGameOver]: {
    fileName: 'tetris-game-over',
    repeat: false,
  },

  // Space Invaders
  [GAME_BOY_SOUND_TYPE.PlayerShoot]: {
    fileName: 'player-shoot',
    repeat: false,
  },
  [GAME_BOY_SOUND_TYPE.EnemyKilled]: {
    fileName: 'enemy-killed',
    repeat: false,
  },
  [GAME_BOY_SOUND_TYPE.PlayerKilled]: {
    fileName: 'player-killed',
    repeat: false,
  },
}

export { GAME_BOY_SOUNDS_CONFIG };
