import { BUTTON_TYPE, GAME_BOY_PART_TYPE } from "./game-boy-data";

const GAME_BOY_CONFIG = {
  powerOn: true,
  updateTexture: true,
  screen: {
    width: 160,
    height: 144,
    tint: '#96a06e',
  },
  powerButton: {
    moveDistance: 0.114,
    moveSpeed: 1.3,
    powerIndicatorColor: 0xff0000,
  },
  rotation: {
    rotationCursorEnabled: true,
    rotationDragEnabled: true,
    returnTime: 2500,
    cursorRotationSpeed: 0.2,
    dragRotationSpeed: 3,
    standardLerpSpeed: 0.05,
    slowLerpSpeed: 0.01,
    zoomThresholdToDisableRotation: 2.5,
  },
  intro: {
    enabled: false,
    speed: 5,
    rotationX: -20,
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
  [BUTTON_TYPE.CrossLeft]: {
    rotateAxis: 'y',
    rotateAngle: -8,
    moveSpeed: 1,
    keyCode: ['ArrowLeft'],
  },
  [BUTTON_TYPE.CrossRight]: {
    rotateAxis: 'y',
    rotateAngle: 8,
    moveSpeed: 1,
    keyCode: ['ArrowRight'],
  },
  [BUTTON_TYPE.CrossUp]: {
    rotateAxis: 'x',
    rotateAngle: -8,
    moveSpeed: 1,
    keyCode: ['ArrowUp'],
  },
  [BUTTON_TYPE.CrossDown]: {
    rotateAxis: 'x',
    rotateAngle: 8,
    moveSpeed: 1,
    keyCode: ['ArrowDown'],
  },
}

const GAME_BOY_BUTTON_PART_BY_TYPE = {
  [GAME_BOY_PART_TYPE.ButtonA]: BUTTON_TYPE.A,
  [GAME_BOY_PART_TYPE.ButtonB]: BUTTON_TYPE.B,
  [GAME_BOY_PART_TYPE.ButtonStart]: BUTTON_TYPE.Start,
  [GAME_BOY_PART_TYPE.ButtonSelect]: BUTTON_TYPE.Select,
  [GAME_BOY_PART_TYPE.ButtonCrossLeft]: BUTTON_TYPE.CrossLeft,
  [GAME_BOY_PART_TYPE.ButtonCrossRight]: BUTTON_TYPE.CrossRight,
  [GAME_BOY_PART_TYPE.ButtonCrossUp]: BUTTON_TYPE.CrossUp,
  [GAME_BOY_PART_TYPE.ButtonCrossDown]: BUTTON_TYPE.CrossDown,
}

const CROSS_BUTTONS = [
  BUTTON_TYPE.CrossLeft,
  BUTTON_TYPE.CrossRight,
  BUTTON_TYPE.CrossUp,
  BUTTON_TYPE.CrossDown,
]

export {
  GAME_BOY_BUTTONS_CONFIG,
  GAME_BOY_CONFIG,
  GAME_BOY_BUTTON_PART_BY_TYPE,
  CROSS_BUTTONS,
};
