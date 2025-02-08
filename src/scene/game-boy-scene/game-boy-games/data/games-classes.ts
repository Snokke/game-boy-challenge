import SpaceInvaders from "../games/space-invaders/space-invaders";
import Tetris from "../games/tetris/tetris";
import Zelda from "../games/zelda/zelda";
import { GAME_TYPE } from "./games-config";

const GAMES_CLASSES = {
  [GAME_TYPE.Tetris]: Tetris,
  [GAME_TYPE.Zelda]: Zelda,
  [GAME_TYPE.SpaceInvaders]: SpaceInvaders,
}

export { GAMES_CLASSES };
