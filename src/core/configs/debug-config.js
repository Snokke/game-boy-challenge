import { GAME_TYPE } from "../../scene/game-boy-scene/game-boy-games/data/games-config";
import { SPACE_INVADERS_SCREEN_TYPE } from "../../scene/game-boy-scene/game-boy-games/games/space-invaders/data/space-invaders-data";
import { TETRIS_SCREEN_TYPE } from "../../scene/game-boy-scene/game-boy-games/games/tetris/data/tetris-data";

const DEBUG_CONFIG = {
  fpsMeter: true,
  rendererStats: false,
  orbitControls: false,
  startState: {
    disableIntro: true,
    zoomIn: true,
    enableGameBoy: true,
    loadGame: GAME_TYPE.Tetris,
    // loadGame: GAME_TYPE.Tetris,
    // startScreen: SPACE_INVADERS_SCREEN_TYPE.Round,
    startScreen: TETRIS_SCREEN_TYPE.License,
  },
};

export default DEBUG_CONFIG;
