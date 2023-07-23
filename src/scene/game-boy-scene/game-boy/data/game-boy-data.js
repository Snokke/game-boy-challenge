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
  GAME_BOY_PART_TYPE.VolumeControl,
]

const GAME_BOY_CROSS_PARTS = [
  GAME_BOY_PART_TYPE.ButtonCrossLeft,
  GAME_BOY_PART_TYPE.ButtonCrossRight,
  GAME_BOY_PART_TYPE.ButtonCrossUp,
  GAME_BOY_PART_TYPE.ButtonCrossDown,
]

export { GAME_BOY_PART_TYPE, GAME_BOY_ACTIVE_PARTS, GAME_BOY_CROSS_PARTS };
