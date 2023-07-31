const GAME_BOY_PART_TYPE = {
  Body: 'body',
  ButtonA: 'button-a',
  ButtonB: 'button-b',
  ButtonCrossLeft: 'button-cross-left',
  ButtonCrossRight: 'button-cross-right',
  ButtonCrossUp: 'button-cross-up',
  ButtonCrossDown: 'button-cross-down',
  ButtonSelect: 'button-select',
  ButtonStart: 'button-start',
  PowerButton: 'power-button',
  PowerButtonFrame: 'power-button-frame',
  PowerIndicator: 'power-indicator',
  Screen: 'screen',
  VolumeControl: 'volume-control',
}

const GAME_BOY_ACTIVE_PARTS = [
  GAME_BOY_PART_TYPE.ButtonA,
  GAME_BOY_PART_TYPE.ButtonB,
  GAME_BOY_PART_TYPE.ButtonCrossLeft,
  GAME_BOY_PART_TYPE.ButtonCrossRight,
  GAME_BOY_PART_TYPE.ButtonCrossUp,
  GAME_BOY_PART_TYPE.ButtonCrossDown,
  GAME_BOY_PART_TYPE.ButtonSelect,
  GAME_BOY_PART_TYPE.ButtonStart,
  GAME_BOY_PART_TYPE.PowerButton,
  GAME_BOY_PART_TYPE.PowerButtonFrame,
  GAME_BOY_PART_TYPE.VolumeControl,
]

const GAME_BOY_DRAGGABLE_PARTS = [
  GAME_BOY_PART_TYPE.Body,
  GAME_BOY_PART_TYPE.PowerIndicator,
  GAME_BOY_PART_TYPE.Screen,
]

const GAME_BOY_CROSS_PARTS = [
  GAME_BOY_PART_TYPE.ButtonCrossLeft,
  GAME_BOY_PART_TYPE.ButtonCrossRight,
  GAME_BOY_PART_TYPE.ButtonCrossUp,
  GAME_BOY_PART_TYPE.ButtonCrossDown,
]

const BUTTON_TYPE = {
  A: 'A',
  B: 'B',
  Start: 'START',
  Select: 'SELECT',
  CrossLeft: 'CROSS_LEFT',
  CrossRight: 'CROSS_RIGHT',
  CrossUp: 'CROSS_UP',
  CrossDown: 'CROSS_DOWN',
}

const POWER_STATE = {
  On: 'ON',
  Off: 'OFF',
}

const CARTRIDGE_STATE = {
  Inserted: 'INSERTED',
  NotInserted: 'NOT_INSERTED',
}

export {
  GAME_BOY_PART_TYPE,
  GAME_BOY_ACTIVE_PARTS,
  GAME_BOY_CROSS_PARTS,
  BUTTON_TYPE,
  GAME_BOY_DRAGGABLE_PARTS,
  POWER_STATE,
  CARTRIDGE_STATE,
};
