import * as THREE from 'three';
import { EventEmitter } from 'pixi.js';
import GUIHelper from '../../core/helpers/gui-helper/gui-helper';
import { GAME_BOY_CONFIG } from './game-boy/data/game-boy-config';
import { CARTRIDGE_TYPE } from './cartridges/data/cartridges-config';
import { TETRIS_CONFIG } from './game-boy-games/games/tetris/data/tetris-config';
import { POWER_STATE } from './game-boy/data/game-boy-data';
import { SPACE_INVADERS_CONFIG } from './game-boy-games/games/space-invaders/data/space-invaders-config';
import { SOUNDS_CONFIG } from '../../Data/Configs/Main/sounds-config';
import DEBUG_CONFIG from '../../Data/Configs/Main/debug-config';

export default class GameBoyDebug extends THREE.Group {
  public events: EventEmitter;

  private gameBoyPowerStateController: any;
  private gameBoyTurnOnButton: any;
  private cartridgeTypeController: any;
  private ejectCartridgeButton: any;
  private audioEnabledController: any;
  private gameBoyVolumeController: any;
  private tetrisCartridgeStateController: any;
  private tetrisBestScoreController: any;
  private restartTetrisButton: any;
  private disableFallingButton: any;
  private clearBottomLineButton: any;
  private spaceInvadersBestScoreController: any;
  private spaceInvadersInvincibilityButton: any;
  private tetrisBestScoreObject: any;
  private spaceInvadersBestScoreObject: any;
  private isTetrisFallingDisabled: boolean;
  private powerState: { value: POWER_STATE };

  constructor() {
    super();

    this.events = new EventEmitter();

    this.isTetrisFallingDisabled = false;

    this.init();
  }

  public updateGameBoyPowerState(): void {
    if (GAME_BOY_CONFIG.powerOn) {
      this.powerState.value = POWER_STATE.On;
    } else {
      this.powerState.value = POWER_STATE.Off;
    }

    this.gameBoyPowerStateController.refresh();
  }

  public updateGameBoyTurnOnButton(): void {
    if (GAME_BOY_CONFIG.powerOn) {
      this.gameBoyTurnOnButton.title = 'Turn off';
    } else {
      this.gameBoyTurnOnButton.title = 'Turn on';
    }
  }

  public updateCartridgeType(): void {
    this.cartridgeTypeController.refresh();
  }

  public enableEjectCartridgeButton(): void {
    this.ejectCartridgeButton.disabled = false;
  }

  public disableEjectCartridgeButton(): void {
    this.ejectCartridgeButton.disabled = true;
  }

  public updateSoundsEnabledController(): void {
    this.audioEnabledController.refresh();
  }

  public updateGameBoyVolume(): void {
    this.gameBoyVolumeController.refresh();
  }

  public updateTetrisCartridgeState(): void {
    this.tetrisCartridgeStateController.refresh();
  }

  public updateTetrisBestScore(score: number): void {
    this.tetrisBestScoreObject.value = score.toString();
    this.tetrisBestScoreController.refresh();
  }

  public enableTetrisButtons(): void {
    this.restartTetrisButton.disabled = false;
    this.disableFallingButton.disabled = false;
    this.clearBottomLineButton.disabled = false;
  }

  public disableTetrisButtons(): void {
    this.restartTetrisButton.disabled = true;
    this.disableFallingButton.disabled = true;
    this.clearBottomLineButton.disabled = true;
  }

  public updateSpaceInvadersBestScore(score: number): void {
    this.spaceInvadersBestScoreObject.value = score.toString();
    this.spaceInvadersBestScoreController.refresh();
  }

  private init(): void {
    this.initGeneralFolder();
    this.initGameBoyFolder();
    this.initTetrisFolder();
    this.initSpaceInvadersFolder();
  }

  private initGeneralFolder(): void {
    const generalFolder = (<any>GUIHelper.getGui()).addFolder({
      title: 'General',
      expanded: false,
    });

    generalFolder.addInput(DEBUG_CONFIG, 'fpsMeter', {
      label: 'FPS meter',
    }).on('change', () => {
      this.events.emit('fpsMeterChanged');
    });

    generalFolder.addInput(DEBUG_CONFIG, 'orbitControls', {
      label: 'Orbit controls',
    }).on('change', () => {
      this.events.emit('orbitControlsChanged');
    });

    generalFolder.addSeparator();

    this.audioEnabledController = generalFolder.addInput(SOUNDS_CONFIG, 'enabled', {
      label: 'Audio',
    }).on('change', () => {
      this.events.emit('audioEnabledChanged');
    });

    generalFolder.addInput(SOUNDS_CONFIG, 'masterVolume', {
      label: 'Master volume',
      min: 0,
      max: 1,
    }).on('change', () => {
      this.events.emit('masterVolumeChanged');
    });

    this.gameBoyVolumeController = generalFolder.addInput(SOUNDS_CONFIG, 'gameBoyVolume', {
      label: 'Game Boy volume',
      min: 0,
      max: 1,
    }).on('change', () => {
      this.events.emit('gameBoyVolumeChanged');
    });

    generalFolder.addSeparator();

    generalFolder.addInput(GAME_BOY_CONFIG.rotation, 'debugRotationCursorEnabled', {
      label: 'Rotation by cursor',
    }).on('change', () => {
      this.events.emit('rotationCursorChanged');
    });

    generalFolder.addInput(GAME_BOY_CONFIG.rotation, 'debugRotationDragEnabled', {
      label: 'Rotation by drag',
    }).on('change', () => {
      this.events.emit('rotationDragChanged');
    });
  }

  private initGameBoyFolder(): void {
    const gameBoyFolder = (<any>GUIHelper.getGui()).addFolder({
      title: 'Game Boy',
      expanded: false,
    });

    this.powerState = { value: POWER_STATE.Off };
    this.gameBoyPowerStateController = gameBoyFolder.addInput(this.powerState, 'value', {
      label: 'Power status',
      disabled: true,
    });

    this.gameBoyTurnOnButton = gameBoyFolder.addButton({
      title: 'Turn on',
    }).on('click', () => {
      this.events.emit('turnOnButtonClicked');
    });

    gameBoyFolder.addSeparator();

    this.cartridgeTypeController = gameBoyFolder.addInput(GAME_BOY_CONFIG, 'currentCartridge', {
      label: 'Current cartridge',
      disabled: true,
    });

    let selectedCartridge: CARTRIDGE_TYPE = CARTRIDGE_TYPE.Tetris;
    gameBoyFolder.addBlade({
      view: 'list',
      label: 'Cartridge',
      options: [
        { text: 'Tetris', value: CARTRIDGE_TYPE.Tetris },
        { text: 'Legend of Zelda', value: CARTRIDGE_TYPE.Zelda },
        { text: 'Space Invaders', value: CARTRIDGE_TYPE.SpaceInvaders },
      ],
      value: CARTRIDGE_TYPE.Tetris,
    }).on('change', (cartridgeType) => {
      selectedCartridge = cartridgeType.value;
    });

    gameBoyFolder.addButton({
      title: 'Insert selected cartridge',
    }).on('click', () => {
      this.events.emit('insertCartridgeButtonClicked', selectedCartridge);
    });

    this.ejectCartridgeButton = gameBoyFolder.addButton({
      title: 'Eject cartridge',
      disabled: true,
    }).on('click', () => {
      this.events.emit('ejectCartridgeButtonClicked');
    });
  }

  private initTetrisFolder(): void {
    const tetrisFolder = (<any>GUIHelper.getGui()).addFolder({
      title: 'Tetris',
      expanded: false,
    });

    this.tetrisCartridgeStateController = tetrisFolder.addInput(TETRIS_CONFIG, 'cartridgeState', {
      label: 'Cartridge state',
      disabled: true,
    });

    this.tetrisBestScoreObject = { value: '0' };
    this.tetrisBestScoreController = tetrisFolder.addInput(this.tetrisBestScoreObject, 'value', {
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

    this.restartTetrisButton = tetrisFolder.addButton({
      title: 'Restart game',
      disabled: true,
    }).on('click', () => {
      this.events.emit('restartTetrisButtonClicked', selectedLevel);
    });

    tetrisFolder.addSeparator();

    tetrisFolder.addInput(TETRIS_CONFIG, 'allowInvisibleShape', {
      label: 'Invisible shape',
    });

    const tetrisCheatsFolder = tetrisFolder.addFolder({
      title: 'Cheats',
      expanded: false,
    });

    this.disableFallingButton = tetrisCheatsFolder.addButton({
      title: 'Disable falling',
      disabled: true,
    }).on('click', () => {
      this.isTetrisFallingDisabled = !this.isTetrisFallingDisabled;

      if (this.isTetrisFallingDisabled) {
        this.disableFallingButton.title = 'Enable falling';
      } else {
        this.disableFallingButton.title = 'Disable falling';
      }

      this.events.emit('tetrisDisableFalling');
    });

    this.clearBottomLineButton = tetrisCheatsFolder.addButton({
      title: 'Clear bottom line',
      disabled: true,
    }).on('click', () => {
      this.events.emit('tetrisClearBottomLine');
    });
  }

  private initSpaceInvadersFolder(): void {
    const spaceInvadersFolder = (<any>GUIHelper.getGui()).addFolder({
      title: 'Space Invaders',
      expanded: false,
    });

    spaceInvadersFolder.addInput(SPACE_INVADERS_CONFIG, 'cartridgeState', {
      label: 'Cartridge state',
      disabled: true,
    });

    this.spaceInvadersBestScoreObject = { value: '0' };
    this.spaceInvadersBestScoreController = spaceInvadersFolder.addInput(this.spaceInvadersBestScoreObject, 'value', {
      label: 'Best score',
      disabled: true,
    });

    const spaceInvadersCheatsFolder = spaceInvadersFolder.addFolder({
      title: 'Cheats',
      expanded: false,
    });

    this.spaceInvadersInvincibilityButton = spaceInvadersCheatsFolder.addButton({
      title: 'Make invincible',
    }).on('click', () => {
      SPACE_INVADERS_CONFIG.playerInvincible = !SPACE_INVADERS_CONFIG.playerInvincible;

      if (SPACE_INVADERS_CONFIG.playerInvincible) {
        this.spaceInvadersInvincibilityButton.title = 'Make vulnerable';
      } else {
        this.spaceInvadersInvincibilityButton.title = 'Make invincible';
      }
    });

    spaceInvadersCheatsFolder.addInput(SPACE_INVADERS_CONFIG.player, 'reloadTime', {
      label: 'Reload time',
      min: 0,
      max: 1000,
      step: 1,
    });
  }
}
