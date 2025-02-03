import * as THREE from 'three';
import { Application, EventEmitter } from 'pixi.js';
import { SCENE_OBJECT_TYPE } from './data/game-boy-scene-data';
import { GAME_BOY_CONFIG } from './game-boy/data/game-boy-config';
import { CARTRIDGES_BY_TYPE_CONFIG, CARTRIDGE_TYPE } from './cartridges/data/cartridges-config';
import SCENE_CONFIG from '../../Data/Configs/Main/scene-config';
import { CARTRIDGE_STATE } from './game-boy/data/game-boy-data';
import { TETRIS_CONFIG } from './game-boy-games/games/tetris/data/tetris-config';
import { GAME_TYPE } from './game-boy-games/data/games-config';
import { SPACE_INVADERS_CONFIG } from './game-boy-games/games/space-invaders/data/space-invaders-config';
import { SOUNDS_CONFIG } from '../../Data/Configs/Main/sounds-config';
import DEBUG_CONFIG from '../../Data/Configs/Main/debug-config';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import RaycasterController from '../raycaster-controller';
import GameBoyDebug from './game-boy-debug';
import CameraController from './camera-controller/camera-controller';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import Cartridge from './cartridges/cartridge';

export default class GameBoyController {
  public events: EventEmitter;

  private orbitControls: OrbitControls;
  private outlinePass: OutlinePass;
  private raycasterController: RaycasterController;
  private activeObjects: { [key in SCENE_OBJECT_TYPE]?: any };
  private gameBoyDebug: GameBoyDebug;
  private games: any;
  private cameraController: CameraController;
  private pixiApp: Application;

  private pointerPosition: THREE.Vector2;
  private pointerPositionOnDown: THREE.Vector2;
  private dragPointerDownPosition: THREE.Vector2;
  private draggingObject: any;
  private isIntroActive: boolean;

  constructor(data: any) {

    this.events = new EventEmitter();

    this.orbitControls = data.orbitControls;
    this.outlinePass = data.outlinePass;
    this.raycasterController = data.raycasterController;
    this.activeObjects = data.activeObjects;
    this.gameBoyDebug = data.gameBoyDebug;
    this.games = data.games;
    this.cameraController = data.cameraController;
    this.pixiApp = data.pixiApp;

    this.pointerPosition = new THREE.Vector2();
    this.pointerPositionOnDown = new THREE.Vector2();
    this.dragPointerDownPosition = new THREE.Vector2();
    this.draggingObject = null;

    this.isIntroActive = GAME_BOY_CONFIG.intro.enabled && !DEBUG_CONFIG.startState.disableIntro;

    this.init();
  }

  public update(dt: number): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].update(dt);
    this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].update(dt);
    this.cameraController.update(dt);

    if (this.isIntroActive) {
      return;
    }

    const intersect = this.raycasterController.checkIntersection(this.pointerPosition.x, this.pointerPosition.y);

    if (intersect === null) {
      this.pixiApp.canvas.style.cursor = 'auto';
      this.resetGlow();
    }

    if (intersect && intersect.object && !this.draggingObject) {
      this.checkToGlow(intersect);
    }

    if (intersect && intersect.object) {
      const object = intersect.object;
      const sceneObjectType = object.userData.sceneObjectType;
      this.activeObjects[sceneObjectType].onPointerOver(object);
    }
  }

  public onPointerMove(x: number, y: number): void {
    this.pointerPosition.set(x, y);
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].onPointerMove(x, y);

    if (this.draggingObject) {
      const deltaX = this.dragPointerDownPosition.x - x;
      const deltaY = this.dragPointerDownPosition.y - y;
      this.draggingObject.onPointerDragMove(deltaX, deltaY);
    }
  }

  public onPointerDown(x: number, y: number): void {
    this.pointerPositionOnDown.set(x, y);

    const intersect = this.raycasterController.checkIntersection(x, y);

    if (!intersect) {
      return;
    }

    const intersectObject = intersect.object;

    if (intersectObject) {
      const sceneObjectType = intersectObject.userData.sceneObjectType;
      const activeObject = this.activeObjects[sceneObjectType];

      if (intersectObject.userData.isActive) {
        activeObject.onPointerDown(intersectObject);
      }

      if (intersectObject.userData.isDraggable) {
        this.dragPointerDownPosition.set(x, y);
        this.draggingObject = activeObject;
        this.draggingObject.onPointerDragDown(intersectObject);
      }
    }
  }

  public onPointerUp(): void {
    if (this.draggingObject) {
      this.draggingObject.onDragPointerUp();
      this.draggingObject = null;
    }

    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].onPointerUp();
  }

  public onWheelScroll(delta: number): void {
    this.cameraController.onWheelScroll(delta);
  }

  public onUISoundIconChanged(): void {
    this.onSoundsEnabledChanged();
    this.gameBoyDebug.updateSoundsEnabledController();
  }

  private checkToGlow(intersect: THREE.Intersection | null): void {
    const object = intersect?.object;

    if (object === null || !object.userData.isActive || !object.userData.showOutline) {
      this.pixiApp.canvas.style.cursor = 'auto';
      this.resetGlow();

      this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].onPointerOut();

      return;
    }

    if (object.userData.isActive && object.userData.showOutline) {
      this.pixiApp.canvas.style.cursor = 'pointer';

      const sceneObjectType = object.userData.sceneObjectType;
      const meshes = this.activeObjects[sceneObjectType].getOutlineMeshes(object);

      this.setGlow(meshes);
    }
  }

  private resetGlow(): void {
    if (this.outlinePass) {
      this.outlinePass.selectedObjects = [];
    }
  }

  private setGlow(meshes: THREE.Object3D[]): void {
    if (this.outlinePass) {
      this.outlinePass.selectedObjects = meshes;
    }
  }

  private powerOn(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOn();
  }

  private init(): void {
    this.initSignals();
    this.initStartPowerState();
  }

  private initStartPowerState(): void {
    if (GAME_BOY_CONFIG.powerOn) {
      this.powerOn();
    }
  }

  private initSignals(): void {
    this.initIntroSignal();
    this.initActiveObjectsSignals();
    this.initCameraControllerSignals();
    this.initGamesSignals();
    this.initDebugSignals();
  }

  private initIntroSignal(): void {
    const introText = document.querySelector('.intro-text') as HTMLElement;

    if (GAME_BOY_CONFIG.intro.enabled && !DEBUG_CONFIG.startState.disableIntro) {
      introText.innerHTML = 'Click to start';

      if (SCENE_CONFIG.isMobile) {
        introText.classList.add('fastHide');
      }
    }

    window.addEventListener('pointerdown', () => {
      if (this.isIntroActive) {
        this.isIntroActive = false;
        this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableIntro();

        introText.classList.add('hide');
      }
    });
  }

  private initActiveObjectsSignals(): void {
    const gameBoy = this.activeObjects[SCENE_OBJECT_TYPE.GameBoy];
    const cartridges = this.activeObjects[SCENE_OBJECT_TYPE.Cartridges];
    const background = this.activeObjects[SCENE_OBJECT_TYPE.Background];

    gameBoy.events.on('onButtonPress', (buttonType: string) => this.games.onButtonPress(buttonType));
    gameBoy.events.on('onButtonUp', (buttonType: string) => this.games.onButtonUp(buttonType));
    gameBoy.events.on('onPowerOn', () => this.onPowerOn());
    gameBoy.events.on('onPowerOff', () => this.onPowerOff());
    gameBoy.events.on('onGameBoyVolumeChanged', () => this.onGameBoyVolumeChanged());
    gameBoy.events.on('onZoomIn', () => this.cameraController.zoomIn());
    gameBoy.events.on('onZoomOut', () => this.cameraController.zoomOut());
    cartridges.events.on('onCartridgeInserting', () => this.onCartridgeInserting());
    cartridges.events.on('onCartridgeInserted', (cartridge: Cartridge) => this.onCartridgeInserted(cartridge));
    cartridges.events.on('onCartridgeEjecting', () => this.onCartridgeEjecting());
    cartridges.events.on('onCartridgeEjected', () => this.onCartridgeEjected());
    cartridges.events.on('cartridgeTypeChanged', () => this.onCartridgeTypeChanged());
    cartridges.events.on('cartridgeInsertSound', () => gameBoy.playCartridgeInsertSound());
    cartridges.events.on('cartridgeEjectSound', () => gameBoy.playCartridgeEjectSound());
    cartridges.events.on('cartridgeStartEjecting', () => gameBoy.setCartridgePocketStandardTexture());
    background.events.on('onClick', () => gameBoy.onBackgroundClick());
  }

  private initCameraControllerSignals(): void {
    const cartridges = this.activeObjects[SCENE_OBJECT_TYPE.Cartridges];

    this.cameraController.events.on('onRotationDragDisabled', () => this.onRotationDragDisabled());
    this.cameraController.events.on('onZoom', (zoomPercent: number) => cartridges.onZoomChanged(zoomPercent));
  }

  private initGamesSignals(): void {
    this.games.events.on('onTetrisBestScoreChange', () => this.onTetrisBestScoreChange());
    this.games.events.on('onSpaceInvadersBestScoreChange', () => this.onSpaceInvadersBestScoreChange());
    this.games.events.on('gameStarted', (gameType: GAME_TYPE) => this.onGameStarted(gameType));
    this.games.events.on('gameStopped', (gameType: GAME_TYPE) => this.onGameStopped(gameType));
  }

  private initDebugSignals(): void {
    const gameBoy = this.activeObjects[SCENE_OBJECT_TYPE.GameBoy];

    this.gameBoyDebug.events.on('rotationCursorChanged', () => gameBoy.onDebugRotationChanged());
    this.gameBoyDebug.events.on('rotationDragChanged', () => gameBoy.onDebugRotationChanged());
    this.gameBoyDebug.events.on('fpsMeterChanged', () => this.events.emit('fpsMeterChanged'));
    this.gameBoyDebug.events.on('orbitControlsChanged', () => this.onOrbitControlsChanged());
    this.gameBoyDebug.events.on('turnOnButtonClicked', () => gameBoy.powerButtonSwitch());
    this.gameBoyDebug.events.on('ejectCartridgeButtonClicked', () => this.onEjectCartridgeButtonClicked());
    this.gameBoyDebug.events.on('insertCartridgeButtonClicked', (cartridgeType: CARTRIDGE_TYPE) => this.onInsertCartridgeButtonClicked(cartridgeType));
    this.gameBoyDebug.events.on('audioEnabledChanged', () => this.onDebugSoundsEnabledChanged());
    this.gameBoyDebug.events.on('masterVolumeChanged', () => this.onMasterVolumeChanged());
    this.gameBoyDebug.events.on('gameBoyVolumeChanged', () => this.onDebugGameBoyVolumeChanged());
    this.gameBoyDebug.events.on('restartTetrisButtonClicked', (level: number) => this.restartTetrisButtonClicked(level));
    this.gameBoyDebug.events.on('tetrisDisableFalling', () => this.onTetrisDisableFalling());
    this.gameBoyDebug.events.on('tetrisClearBottomLine', () => this.onTetrisClearBottomLine());
  }

  private onPowerOn(): void {
    this.gameBoyDebug.updateGameBoyPowerState();
    this.gameBoyDebug.updateGameBoyTurnOnButton();
    this.games.onPowerOn();
  }

  private onPowerOff(): void {
    this.gameBoyDebug.updateGameBoyPowerState();
    this.gameBoyDebug.updateGameBoyTurnOnButton();
    this.games.onPowerOff();
  }

  private onGameBoyVolumeChanged(): void {
    this.games.onVolumeChanged();
    this.gameBoyDebug.updateGameBoyVolume();
  }

  private onCartridgeInserting(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableRotation();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].resetRotationFast();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOff();
  }

  private onCartridgeEjecting(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableRotation();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].resetRotationFast();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOff();
  }

  private onCartridgeInserted(cartridge: Cartridge): void {
    const cartridgeType: CARTRIDGE_TYPE = cartridge.getType();
    const gameType: GAME_TYPE = CARTRIDGES_BY_TYPE_CONFIG[cartridgeType].game;
    this.games.setGame(gameType);

    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].addCartridge(cartridge);
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].enableRotation();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOn();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].setCartridgePocketStandardTexture();

    this.gameBoyDebug.enableEjectCartridgeButton();

    if (cartridgeType === CARTRIDGE_TYPE.Tetris) {
      TETRIS_CONFIG.cartridgeState = CARTRIDGE_STATE.Inserted;
      this.gameBoyDebug.updateTetrisCartridgeState();
    }
  }

  private onCartridgeEjected(): void {
    this.games.setNoGame();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].enableRotation();
    this.gameBoyDebug.disableEjectCartridgeButton();

    TETRIS_CONFIG.cartridgeState = CARTRIDGE_STATE.NotInserted;
    this.gameBoyDebug.updateTetrisCartridgeState();
  }

  private onCartridgeTypeChanged(): void {
    this.gameBoyDebug.updateCartridgeType();
  }

  private onRotationDragDisabled(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].resetRotation();
  }

  private onOrbitControlsChanged(): void {
    this.orbitControls.enabled = DEBUG_CONFIG.orbitControls;
  }

  private onEjectCartridgeButtonClicked(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].ejectCartridge();
  }

  private onInsertCartridgeButtonClicked(cartridgeType: CARTRIDGE_TYPE): void {
    this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].insertCartridge(cartridgeType);
  }

  private onSoundsEnabledChanged(): void {
    if (SOUNDS_CONFIG.enabled) {
      this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].enableSound();
    } else {
      this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableSound();
    }
  }

  private onDebugSoundsEnabledChanged(): void {
    this.onSoundsEnabledChanged();
    this.events.emit('onSoundsEnabledChanged');
  }

  private onMasterVolumeChanged(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].onVolumeChanged(SOUNDS_CONFIG.masterVolume);
  }

  private onDebugGameBoyVolumeChanged(): void {
    this.games.onVolumeChanged();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].updateVolumeControlRotation();
  }

  private onTetrisBestScoreChange(): void {
    this.gameBoyDebug.updateTetrisBestScore(TETRIS_CONFIG.bestScore);
  }

  private onSpaceInvadersBestScoreChange(): void {
    this.gameBoyDebug.updateSpaceInvadersBestScore(SPACE_INVADERS_CONFIG.bestScore);
  }

  private onGameStarted(gameType: GAME_TYPE): void {
    if (gameType === GAME_TYPE.Zelda) {
      this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].showZeldaIntro();
    }

    if (gameType === GAME_TYPE.Tetris) {
      this.gameBoyDebug.enableTetrisButtons();
    }
  }

  private onGameStopped(gameType: GAME_TYPE): void {
    if (gameType === GAME_TYPE.Tetris) {
      this.gameBoyDebug.disableTetrisButtons();
    }
  }

  private restartTetrisButtonClicked(level: number): void {
    this.games.restartTetris(level);
  }

  private onTetrisDisableFalling(): void {
    this.games.disableTetrisFalling();
  }

  private onTetrisClearBottomLine(): void {
    this.games.clearTetrisBottomLine();
  }
}
