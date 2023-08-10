import { BUTTON_TYPE, GAME_BOY_PART_TYPE } from "./game-boy-data";

const GAME_BOY_CONFIG = {
  powerOn: false,
  updateTexture: true,
  currentCartridge: 'NONE',
  screen: {
    width: 160 * 1,
    height: 144 * 1,
    scale: 1,
    tint: '#96a06e',
    blackColor: 0x282a1e,
    whiteColor: 0x96a06e,
  },
  powerButton: {
    moveDistance: 0.114,
    moveSpeed: 1.3,
    powerIndicatorColor: 0xff0000,
  },
  buttons: {
    firstRepeatTime: 400,
    repeatTime: 0.04,
  },
  volumeController: {
    sensitivity: 0.01,
    maxAngle: 120,
    hideTime: 1200,
  },
  rotation: {
    rotationCursorEnabled: true,
    rotationDragEnabled: true,
    debugRotationCursorEnabled: true,
    debugRotationDragEnabled:true,
    returnTime: 5000,
    cursorRotationSpeed: 0.2,
    dragRotationSpeed: 4,
    mobileDragRotationSpeed: 8,
    standardLerpSpeed: 0.05,
    slowLerpSpeed: 0.01,
    fastLerpSpeed: 0.07,
    zoomThresholdToDisableRotation: 2.3,
  },
  intro: {
    enabled: true,
    speed: 5,
    rotationX: -20,
  },
}

const GAME_BOY_BUTTONS_CONFIG = {
  [BUTTON_TYPE.A]: {
    moveDistance: 0.055,
    moveSpeed: 0.5,
    keyRepeat: false,
    keyCode: ['KeyX', 'Space'],
  },
  [BUTTON_TYPE.B]: {
    moveDistance: 0.055,
    moveSpeed: 0.5,
    keyRepeat: false,
    keyCode: ['KeyZ'],
  },
  [BUTTON_TYPE.Select]: {
    moveDistance: 0.039,
    moveSpeed: 0.5,
    keyRepeat: false,
  },
  [BUTTON_TYPE.Start]: {
    moveDistance: 0.039,
    moveSpeed: 0.5,
    keyRepeat: false,
    keyCode: ['Enter'],
  },
  [BUTTON_TYPE.CrossLeft]: {
    rotateAxis: 'y',
    rotateAngle: -8,
    moveSpeed: 1,
    keyRepeat: true,
    keyCode: ['ArrowLeft', 'KeyA'],
  },
  [BUTTON_TYPE.CrossRight]: {
    rotateAxis: 'y',
    rotateAngle: 8,
    moveSpeed: 1,
    keyRepeat: true,
    keyCode: ['ArrowRight', 'KeyD'],
  },
  [BUTTON_TYPE.CrossUp]: {
    rotateAxis: 'x',
    rotateAngle: -8,
    moveSpeed: 1,
    keyRepeat: false,
    keyCode: ['ArrowUp', 'KeyW'],
  },
  [BUTTON_TYPE.CrossDown]: {
    rotateAxis: 'x',
    rotateAngle: 8,
    moveSpeed: 1,
    keyRepeat: true,
    keyCode: ['ArrowDown', 'KeyS'],
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
