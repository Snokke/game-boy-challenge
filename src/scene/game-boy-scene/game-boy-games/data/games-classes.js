import Tetris from "../games/tetris/tetris";
import { GAME_TYPE } from "./games-config";

const GAMES_CLASSES = {
  [GAME_TYPE.Tetris]: Tetris,
  [GAME_TYPE.Zelda]: null,
  [GAME_TYPE.DuckTales]: null,
}

export { GAMES_CLASSES };
