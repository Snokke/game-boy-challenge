import * as THREE from 'three';
import GUIHelper from '../../core/helpers/gui-helper/gui-helper';
import { GAME_BOY_CONFIG } from './game-boy/data/game-boy-config';
import { MessageDispatcher } from 'black-engine';
import { CARTRIDGE_TYPE } from './cartridges/data/cartridges-config';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import { TETRIS_CONFIG } from './game-boy-games/games/tetris/data/tetris-config';
import { POWER_STATE } from './game-boy/data/game-boy-data';
import { SOUNDS_CONFIG } from '../../core/configs/sounds-config';

export default class GameBoyDebug extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._gameBoyPowerStateController = null;
    this._gameBoyTurnOnButton = null;
    this._cartridgeTypeController = null;
    this._ejectCartridgeButton = null;
    this._audioEnabledController = null;
    this._gameBoyVolumeController = null;
    this._tetrisCartridgeStateController = null;
    this._bestScoreController = null;
    this._restartTetrisButton = null;
    this._disableFallingButton = null;
    // this._clearBottomLineButton = null;

    this._isTetrisFallingDisabled = false;

    this._init();
  }

  updateGameBoyPowerState() {
    if (GAME_BOY_CONFIG.powerOn) {
      this._powerState.value = POWER_STATE.On;
    } else {
      this._powerState.value = POWER_STATE.Off;
    }

    this._gameBoyPowerStateController.refresh();
  }

  updateGameBoyTurnOnButton() {
    if (GAME_BOY_CONFIG.powerOn) {
      this._gameBoyTurnOnButton.title = 'Turn off';
    } else {
      this._gameBoyTurnOnButton.title = 'Turn on';
    }
  }

  updateCartridgeType() {
    this._cartridgeTypeController.refresh();
  }

  enableEjectCartridgeButton() {
    this._ejectCartridgeButton.disabled = false;
  }

  disableEjectCartridgeButton() {
    this._ejectCartridgeButton.disabled = true;
  }

  updateSoundsEnabledController() {
    this._audioEnabledController.refresh();
  }

  updateGameBoyVolume() {
    this._gameBoyVolumeController.refresh();
  }

  updateTetrisCartridgeState() {
    this._tetrisCartridgeStateController.refresh();
  }

  updateTetrisBestScore(score) {
    this._bestScoreObject.value = score.toString();
    this._bestScoreController.refresh();
  }

  enableTetrisButtons() {
    this._restartTetrisButton.disabled = false;
    this._disableFallingButton.disabled = false;
    // this._clearBottomLineButton.disabled = false;
  }

  disableTetrisButtons() {
    this._restartTetrisButton.disabled = true;
    this._disableFallingButton.disabled = true;
    // this._clearBottomLineButton.disabled = true;
  }

  _init() {
    this._initGeneralFolder();
    this._initGameBoyFolder();
    this._initTetrisFolder();
  }

  _initGeneralFolder() {
    const generalFolder = GUIHelper.getGui().addFolder({
      title: 'General',
      expanded: false,
    });

    generalFolder.addInput(DEBUG_CONFIG, 'fpsMeter', {
      label: 'FPS meter',
    }).on('change', () => {
      this.events.post('fpsMeterChanged');
    });

    generalFolder.addInput(DEBUG_CONFIG, 'orbitControls', {
      label: 'Orbit controls',
    }).on('change', () => {
      this.events.post('orbitControlsChanged');
    });

    generalFolder.addSeparator();

    this._audioEnabledController = generalFolder.addInput(SOUNDS_CONFIG, 'enabled', {
      label: 'Audio',
    }).on('change', () => {
      this.events.post('audioEnabledChanged');
    });

    generalFolder.addInput(SOUNDS_CONFIG, 'masterVolume', {
      label: 'Master volume',
      min: 0,
      max: 1,
    }).on('change', () => {
      this.events.post('masterVolumeChanged');
    });

    this._gameBoyVolumeController = generalFolder.addInput(SOUNDS_CONFIG, 'gameBoyVolume', {
      label: 'Game Boy volume',
      min: 0,
      max: 1,
    }).on('change', () => {
      this.events.post('gameBoyVolumeChanged');
    });

    generalFolder.addSeparator();

    generalFolder.addInput(GAME_BOY_CONFIG.rotation, 'debugRotationCursorEnabled', {
      label: 'Rotation by cursor',
    }).on('change', () => {
      this.events.post('rotationCursorChanged');
    });

    generalFolder.addInput(GAME_BOY_CONFIG.rotation, 'debugRotationDragEnabled', {
      label: 'Rotation by drag',
    }).on('change', () => {
      this.events.post('rotationDragChanged');
    });
  }

  _initGameBoyFolder() {
    const gameBoyFolder = GUIHelper.getGui().addFolder({
      title: 'Game Boy',
      expanded: false,
    });

    this._powerState = { value: POWER_STATE.Off };
    this._gameBoyPowerStateController = gameBoyFolder.addInput(this._powerState, 'value', {
      label: 'Power status',
      disabled: true,
    });

    this._gameBoyTurnOnButton = gameBoyFolder.addButton({
      title: 'Turn on',
    }).on('click', () => {
      this.events.post('turnOnButtonClicked');
    });

    gameBoyFolder.addSeparator();

    this._cartridgeTypeController = gameBoyFolder.addInput(GAME_BOY_CONFIG, 'currentCartridge', {
      label: 'Current cartridge',
      disabled: true,
    });

    let selectedCartridge = CARTRIDGE_TYPE.Tetris;
    gameBoyFolder.addBlade({
      view: 'list',
      label: 'Cartridge',
      options: [
        { text: 'Tetris', value: CARTRIDGE_TYPE.Tetris },
        { text: 'Legend of Zelda', value: CARTRIDGE_TYPE.Zelda },
        { text: 'Duck Tales', value: CARTRIDGE_TYPE.DuckTales },
      ],
      value: CARTRIDGE_TYPE.Tetris,
    }).on('change', (cartridgeType) => {
      selectedCartridge = cartridgeType.value;
    });

    gameBoyFolder.addButton({
      title: 'Insert selected cartridge',
    }).on('click', () => {
      this.events.post('insertCartridgeButtonClicked', selectedCartridge);
    });

    this._ejectCartridgeButton = gameBoyFolder.addButton({
      title: 'Eject cartridge',
      disabled: true,
    }).on('click', () => {
      this.events.post('ejectCartridgeButtonClicked');
    });
  }

  _initTetrisFolder() {
    const tetrisFolder = GUIHelper.getGui().addFolder({
      title: 'Tetris',
      expanded: false,
    });

    this._tetrisCartridgeStateController = tetrisFolder.addInput(TETRIS_CONFIG, 'cartridgeState', {
      label: 'Cartridge state',
      disabled: true,
    });

    this._bestScoreObject = { value: '0' };
    this._bestScoreController = tetrisFolder.addInput(this._bestScoreObject, 'value', {
      label: 'Best score',
      disabled: true,
    });

    tetrisFolder.addSeparator();

    let selectedLevel = 0;
    tetrisFolder.addBlade({
      view: 'list',
      label: 'Start level',
      options: [
        { text: '0', value: 0 },
        { text: '1', value: 1 },
        { text: '2', value: 2 },
        { text: '3', value: 3 },
        { text: '4', value: 4 },
        { text: '5', value: 5 },
        { text: '6', value: 6 },
        { text: '7', value: 7 },
        { text: '8', value: 8 },
        { text: '9', value: 9 },
        { text: '10', value: 10 },
        { text: '11', value: 11 },
        { text: '12', value: 12 },
        { text: '13', value: 13 },
        { text: '14', value: 14 },
        { text: '15', value: 15 },
        { text: '16', value: 16 },
        { text: '17', value: 17 },
        { text: '18', value: 18 },
        { text: '19', value: 19 },
        { text: '20', value: 20 },
      ],
      value: 0,
    }).on('change', (level) => {
      selectedLevel = level.value;
    });

    this._restartTetrisButton = tetrisFolder.addButton({
      title: 'Restart game',
      disabled: true,
    }).on('click', () => {
      this.events.post('restartTetrisButtonClicked', selectedLevel);
    });

    const tetrisCheatsFolder = tetrisFolder.addFolder({
      title: 'Cheats',
      expanded: false,
    });

    this._disableFallingButton = tetrisCheatsFolder.addButton({
      title: 'Disable falling',
      disabled: true,
    }).on('click', () => {
      this._isTetrisFallingDisabled = !this._isTetrisFallingDisabled;

      if (this._isTetrisFallingDisabled) {
        this._disableFallingButton.title = 'Enable falling';
      } else {
        this._disableFallingButton.title = 'Disable falling';
      }

      this.events.post('tetrisDisableFalling');
    });

    // this._clearBottomLineButton = tetrisCheatsFolder.addButton({
    //   title: 'Clear bottom line',
    //   disabled: true,
    // }).on('click', () => {
    //   this.events.post('tetrisClearBottomLine');
    // });
  }
}
