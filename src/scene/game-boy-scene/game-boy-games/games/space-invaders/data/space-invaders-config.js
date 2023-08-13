import { CARTRIDGE_STATE } from "../../../../game-boy/data/game-boy-data";

const SPACE_INVADERS_CONFIG = {
  cartridgeState: CARTRIDGE_STATE.NotInserted,
  player: {
    speed: 2,
    reloadTime: 300,
    livesAtStart: 3,
  },
  field: {
    width: 158,
    height: 130,
  },
  currentRound: 1,
  bestScore: 0,
  playerInvincible: false,
}

export { SPACE_INVADERS_CONFIG };
