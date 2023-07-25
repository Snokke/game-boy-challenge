import { BUTTON_TYPE, GAME_BOY_PART_TYPE } from "./game-boy-data";

const GAME_BOY_CONFIG = {
  powerOn: true,
  screen: {
    width: 160,
    height: 144,
  },
  powerButton: {
    moveDistance: 0.114,
    moveSpeed: 1.3,
    powerIndicatorColor: 0xff0000,
  }
}

const GAME_BOY_BUTTONS_CONFIG = {
  [BUTTON_TYPE.A]: {
    moveDistance: 0.055,
    moveSpeed: 0.5,
    keyCode: ['KeyX'],
  },
  [BUTTON_TYPE.B]: {
    moveDistance: 0.055,
    moveSpeed: 0.5,
    keyCode: ['KeyZ'],
  },
  [BUTTON_TYPE.Select]: {
    moveDistance: 0.039,
    moveSpeed: 0.5,
  },
  [BUTTON_TYPE.Start]: {
    moveDistance: 0.039,
    moveSpeed: 0.5,
  },
}

const GAME_BOY_PART_BY_TYPE = {
  [GAME_BOY_PART_TYPE.ButtonA]: BUTTON_TYPE.A,
  [GAME_BOY_PART_TYPE.ButtonB]: BUTTON_TYPE.B,
  [GAME_BOY_PART_TYPE.ButtonStart]: BUTTON_TYPE.Start,
  [GAME_BOY_PART_TYPE.ButtonSelect]: BUTTON_TYPE.Select,
}

export { GAME_BOY_BUTTONS_CONFIG, GAME_BOY_CONFIG, GAME_BOY_PART_BY_TYPE };
