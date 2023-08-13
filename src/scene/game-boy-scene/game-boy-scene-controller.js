import { Black, MessageDispatcher } from 'black-engine';
import * as THREE from 'three';
import { SCENE_OBJECT_TYPE } from './data/game-boy-scene-data';
import { GAME_BOY_CONFIG } from './game-boy/data/game-boy-config';
import { CARTRIDGES_BY_TYPE_CONFIG, CARTRIDGE_TYPE } from './cartridges/data/cartridges-config';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import { SOUNDS_CONFIG } from '../../core/configs/sounds-config';
import SCENE_CONFIG from '../../core/configs/scene-config';
import { CARTRIDGE_STATE } from './game-boy/data/game-boy-data';
import { TETRIS_CONFIG } from './game-boy-games/games/tetris/data/tetris-config';
import { GAME_TYPE } from './game-boy-games/data/games-config';
import { SPACE_INVADERS_CONFIG } from './game-boy-games/games/space-invaders/data/space-invaders-config';

export default class GameBoyController {
  constructor(data) {

    this.events = new MessageDispatcher();

    this._scene = data.scene;
    this._camera = data.camera;
    this._renderer = data.renderer;
    this._orbitControls = data.orbitControls;
    this._outlinePass = data.outlinePass;
    this._raycasterController = data.raycasterController;
    this._activeObjects = data.activeObjects;
    this._gameBoyDebug = data.gameBoyDebug;
    this._games = data.games;
    this._cameraController = data.cameraController;
    this._background = data.background;

    this._pointerPosition = new THREE.Vector2();
    this._pointerPositionOnDown = new THREE.Vector2();
    this._dragPointerDownPosition = new THREE.Vector2();
    this._draggingObject = null;

    this._isIntroActive = GAME_BOY_CONFIG.intro.enabled && !DEBUG_CONFIG.startState.disableIntro;

    this._init();
  }

  update(dt) {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].update(dt);
    this._activeObjects[SCENE_OBJECT_TYPE.Cartridges].update(dt);
    this._cameraController.update(dt);
    this._background.update(dt);

    if (this._isIntroActive) {
      return;
    }

    const intersect = this._raycasterController.checkIntersection(this._pointerPosition.x, this._pointerPosition.y);

    if (intersect === null) {
      Black.engine.containerElement.style.cursor = 'auto';
      this._resetGlow();
    }

    if (intersect && intersect.object && !this._draggingObject) {
      this._checkToGlow(intersect);
    }

    if (intersect && intersect.object) {
      const object = intersect.object;
      const sceneObjectType = object.userData.sceneObjectType;
      this._activeObjects[sceneObjectType].onPointerOver(object);
    }
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].onPointerMove(x, y);

    if (this._draggingObject) {
      const deltaX = this._dragPointerDownPosition.x - x;
      const deltaY = this._dragPointerDownPosition.y - y;
      this._draggingObject.onPointerDragMove(deltaX, deltaY);
    }
  }

  onPointerDown(x, y) {
    this._pointerPositionOnDown.set(x, y);

    const intersect = this._raycasterController.checkIntersection(x, y);

    if (!intersect) {
      return;
    }

    const intersectObject = intersect.object;

    if (intersectObject) {
      const sceneObjectType = intersectObject.userData.sceneObjectType;
      const activeObject = this._activeObjects[sceneObjectType];

      if (intersectObject.userData.isActive) {
        activeObject.onPointerDown(intersectObject);
      }

      if (intersectObject.userData.isDraggable) {
        this._dragPointerDownPosition.set(x, y);
        this._draggingObject = activeObject;
        this._draggingObject.onPointerDragDown(intersectObject);
      }
    }
  }

  onPointerUp(x, y) {
    if (this._draggingObject) {
      this._draggingObject.onDragPointerUp();
      this._draggingObject = null;
    }

    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].onPointerUp();
  }

  onWheelScroll(delta) {
    this._cameraController.onWheelScroll(delta);
  }

  onUISoundIconChanged() {
    this._onSoundsEnabledChanged();
    this._gameBoyDebug.updateSoundsEnabledController();
  }

  _checkToGlow(intersect) {
    const object = intersect.object;

    if (object === null || !object.userData.isActive || !object.userData.showOutline) {
      Black.engine.containerElement.style.cursor = 'auto';
      this._resetGlow();

      this._activeObjects[SCENE_OBJECT_TYPE.Cartridges].onPointerOut();

      return;
    }

    if (object.userData.isActive && object.userData.showOutline) {
      Black.engine.containerElement.style.cursor = 'pointer';

      const sceneObjectType = object.userData.sceneObjectType;
      const meshes = this._activeObjects[sceneObjectType].getOutlineMeshes(object);

      this._setGlow(meshes);
    }
  }

  _resetGlow() {
    if (this._outlinePass) {
      this._outlinePass.selectedObjects = [];
    }
  }

  _setGlow(meshes) {
    if (this._outlinePass) {
      this._outlinePass.selectedObjects = meshes;
    }
  }

  _powerOn() {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOn();
  }

  _init() {
    this._initSignals();
    this._initStartPowerState();
  }

  _initStartPowerState() {
    if (GAME_BOY_CONFIG.powerOn) {
      this._powerOn();
    }
  }

  _initSignals() {
    this._initIntroSignal();
    this._initActiveObjectsSignals();
    this._initCameraControllerSignals();
    this._initGamesSignals();
    this._initDebugSignals();
  }

  _initIntroSignal() {
    const introText = document.querySelector('.intro-text');

    if (GAME_BOY_CONFIG.intro.enabled && !DEBUG_CONFIG.startState.disableIntro) {
      introText.innerHTML = 'Click to start';

      if (SCENE_CONFIG.isMobile) {
        introText.classList.add('fastHide');
      }
    }

    window.addEventListener('pointerdown', () => {
      if (this._isIntroActive) {
        this._isIntroActive = false;
        this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableIntro();

        introText.classList.add('hide');
      }
    });
  }

  _initActiveObjectsSignals() {
    const gameBoy = this._activeObjects[SCENE_OBJECT_TYPE.GameBoy];
    const cartridges = this._activeObjects[SCENE_OBJECT_TYPE.Cartridges];
    const background = this._activeObjects[SCENE_OBJECT_TYPE.Background];

    gameBoy.events.on('onButtonPress', (msg, buttonType) => this._games.onButtonPress(buttonType));
    gameBoy.events.on('onButtonUp', (msg, buttonType) => this._games.onButtonUp(buttonType));
    gameBoy.events.on('onPowerOn', () => this._onPowerOn());
    gameBoy.events.on('onPowerOff', () => this._onPowerOff());
    gameBoy.events.on('onGameBoyVolumeChanged', () => this._onGameBoyVolumeChanged());
    gameBoy.events.on('onZoomIn', () => this._cameraController.zoomIn());
    gameBoy.events.on('onZoomOut', () => this._cameraController.zoomOut());
    cartridges.events.on('onCartridgeInserting', () => this._onCartridgeInserting());
    cartridges.events.on('onCartridgeInserted', (msg, cartridge) => this._onCartridgeInserted(cartridge));
    cartridges.events.on('onCartridgeEjecting', () => this._onCartridgeEjecting());
    cartridges.events.on('onCartridgeEjected', () => this._onCartridgeEjected());
    cartridges.events.on('cartridgeTypeChanged', () => this._onCartridgeTypeChanged());
    cartridges.events.on('cartridgeInsertSound', () => gameBoy.playCartridgeInsertSound());
    cartridges.events.on('cartridgeEjectSound', () => gameBoy.playCartridgeEjectSound());
    cartridges.events.on('cartridgeStartEjecting', (msg, percent) => gameBoy.setCartridgePocketStandardTexture());
    background.events.on('onClick', () => gameBoy.onBackgroundClick());
  }

  _initCameraControllerSignals() {
    const cartridges = this._activeObjects[SCENE_OBJECT_TYPE.Cartridges];

    this._cameraController.events.on('onRotationDragDisabled', () => this._onRotationDragDisabled());
    this._cameraController.events.on('onZoom', (msg, zoomPercent) => cartridges.onZoomChanged(zoomPercent));
  }

  _initGamesSignals() {
    this._games.events.on('onTetrisBestScoreChange', () => this._onTetrisBestScoreChange());
    this._games.events.on('onSpaceInvadersBestScoreChange', () => this._onSpaceInvadersBestScoreChange());
    this._games.events.on('gameStarted', (msg, gameType) => this._onGameStarted(gameType));
    this._games.events.on('gameStopped', (msg, gameType) => this._onGameStopped(gameType));
  }

  _initDebugSignals() {
    const gameBoy = this._activeObjects[SCENE_OBJECT_TYPE.GameBoy];

    this._gameBoyDebug.events.on('rotationCursorChanged', () => gameBoy.onDebugRotationChanged());
    this._gameBoyDebug.events.on('rotationDragChanged', () => gameBoy.onDebugRotationChanged());
    this._gameBoyDebug.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
    this._gameBoyDebug.events.on('orbitControlsChanged', () => this._onOrbitControlsChanged());
    this._gameBoyDebug.events.on('turnOnButtonClicked', () => gameBoy.powerButtonSwitch());
    this._gameBoyDebug.events.on('ejectCartridgeButtonClicked', () => this._onEjectCartridgeButtonClicked());
    this._gameBoyDebug.events.on('insertCartridgeButtonClicked', (msg, cartridgeType) => this._onInsertCartridgeButtonClicked(cartridgeType));
    this._gameBoyDebug.events.on('audioEnabledChanged', () => this._onDebugSoundsEnabledChanged());
    this._gameBoyDebug.events.on('masterVolumeChanged', () => this._onMasterVolumeChanged());
    this._gameBoyDebug.events.on('gameBoyVolumeChanged', () => this._onDebugGameBoyVolumeChanged());
    this._gameBoyDebug.events.on('restartTetrisButtonClicked', (msg, level) => this._restartTetrisButtonClicked(level));
    this._gameBoyDebug.events.on('tetrisDisableFalling', () => this._onTetrisDisableFalling());
    this._gameBoyDebug.events.on('tetrisClearBottomLine', () => this._onTetrisClearBottomLine());
  }

  _onPowerOn() {
    this._gameBoyDebug.updateGameBoyPowerState();
    this._gameBoyDebug.updateGameBoyTurnOnButton();
    this._games.onPowerOn();
  }

  _onPowerOff() {
    this._gameBoyDebug.updateGameBoyPowerState();
    this._gameBoyDebug.updateGameBoyTurnOnButton();
    this._games.onPowerOff();
  }

  _onGameBoyVolumeChanged() {
    this._games.onVolumeChanged();
    this._gameBoyDebug.updateGameBoyVolume();
  }

  _onCartridgeInserting() {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableRotation();
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].resetRotationFast();
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOff();
  }

  _onCartridgeEjecting() {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableRotation();
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].resetRotationFast();
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOff();
  }

  _onCartridgeInserted(cartridge) {
    const cartridgeType = cartridge.getType();
    const gameType = CARTRIDGES_BY_TYPE_CONFIG[cartridgeType].game;
    this._games.setGame(gameType);

    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].addCartridge(cartridge);
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].enableRotation();
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOn();
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].setCartridgePocketStandardTexture();

    this._gameBoyDebug.enableEjectCartridgeButton();

    if (cartridgeType === CARTRIDGE_TYPE.Tetris) {
      TETRIS_CONFIG.cartridgeState = CARTRIDGE_STATE.Inserted;
      this._gameBoyDebug.updateTetrisCartridgeState();
    }
  }

  _onCartridgeEjected() {
    this._games.setNoGame();
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].enableRotation();
    this._gameBoyDebug.disableEjectCartridgeButton();

    TETRIS_CONFIG.cartridgeState = CARTRIDGE_STATE.NotInserted;
    this._gameBoyDebug.updateTetrisCartridgeState();
  }

  _onCartridgeTypeChanged() {
    this._gameBoyDebug.updateCartridgeType();
  }

  _onRotationDragDisabled() {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].resetRotation();
  }

  _onOrbitControlsChanged() {
    this._orbitControls.enabled = DEBUG_CONFIG.orbitControls;
  }

  _onEjectCartridgeButtonClicked() {
    this._activeObjects[SCENE_OBJECT_TYPE.Cartridges].ejectCartridge();
  }

  _onInsertCartridgeButtonClicked(cartridgeType) {
    this._activeObjects[SCENE_OBJECT_TYPE.Cartridges].insertCartridge(cartridgeType);
  }

  _onSoundsEnabledChanged() {
    if (SOUNDS_CONFIG.enabled) {
      this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].enableSound();
    } else {
      this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableSound();
    }
  }

  _onDebugSoundsEnabledChanged() {
    this._onSoundsEnabledChanged();
    this.events.post('onSoundsEnabledChanged');
  }

  _onMasterVolumeChanged() {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].onVolumeChanged(SOUNDS_CONFIG.masterVolume);
  }

  _onDebugGameBoyVolumeChanged() {
    this._games.onVolumeChanged();
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].updateVolumeControlRotation();
  }

  _onTetrisBestScoreChange() {
    this._gameBoyDebug.updateTetrisBestScore(TETRIS_CONFIG.bestScore);
  }

  _onSpaceInvadersBestScoreChange() {
    this._gameBoyDebug.updateSpaceInvadersBestScore(SPACE_INVADERS_CONFIG.bestScore);
  }

  _onGameStarted(gameType) {
    if (gameType === GAME_TYPE.Zelda) {
      this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].showZeldaIntro();
    }

    if (gameType === GAME_TYPE.Tetris) {
      this._gameBoyDebug.enableTetrisButtons();
    }
  }

  _onGameStopped(gameType) {
    if (gameType === GAME_TYPE.Tetris) {
      this._gameBoyDebug.disableTetrisButtons();
    }
  }

  _restartTetrisButtonClicked(level) {
    this._games.restartTetris(level);
  }

  _onTetrisDisableFalling() {
    this._games.disableTetrisFalling();
  }

  _onTetrisClearBottomLine() {
    this._games.clearTetrisBottomLine();
  }
}
