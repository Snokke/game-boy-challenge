// import { GAME_TYPE } from "../../../scene/game-boy-scene/game-boy-games/data/games-config";
// import { SPACE_INVADERS_SCREEN_TYPE } from "../../../scene/game-boy-scene/game-boy-games/games/space-invaders/data/space-invaders-data";
// import { TETRIS_SCREEN_TYPE } from "../../../scene/game-boy-scene/game-boy-games/games/tetris/data/tetris-data";

const DEBUG_CONFIG = {
  fpsMeter: false,
  rendererStats: false,
  orbitControls: false,
  withoutUIMode: false,
  startState: {
    disableIntro: false,
    zoomIn: false,
    enableGameBoy: false,
    // loadGame: GAME_TYPE.Tetris,
    // loadGame: GAME_TYPE.SpaceInvaders,
    // startScreen: SPACE_INVADERS_SCREEN_TYPE.Round,
    // startScreen: TETRIS_SCREEN_TYPE.Gameplay,
  },
};

export default DEBUG_CONFIG;
