import * as THREE from 'three';
import GameBoyController from './game-boy-scene-controller';
import GameBoy from './game-boy/game-boy';
import CartridgesController from './cartridges/cartridges-controller';
import { SCENE_OBJECT_TYPE } from './data/game-boy-scene-data';
import GameBoyGames from './game-boy-games/game-boy-games';
import GameBoyDebug from './game-boy-debug';
import CameraController from './camera-controller/camera-controller';
import Background from './background/background';
import { MessageDispatcher } from 'black-engine';
import SCENE_CONFIG from '../../core/configs/scene-config';

export default class GameBoyScene extends THREE.Group {
  constructor(data, raycasterController) {
    super();

    this.events = new MessageDispatcher();

    this._data = data;
    this._data.raycasterController = raycasterController;

    this._gameBoyController = null;
    this._gameBoyGames = null;
    this._gameBoyDebug = null;
    this._activeObjects = {};

    this._isSoundPlayed = false;

    this._init();
  }

  update(dt) {
    if (dt > 0.1) {
      dt = 0.1;
    }

    this._gameBoyController.update(dt);
    this._gameBoyGames.update(dt);
  }

  onPointerMove(x, y) {
    this._gameBoyController.onPointerMove(x, y);
  }

  onPointerDown(x, y) {
    this._gameBoyController.onPointerDown(x, y);
  }

  onPointerUp(x, y) {
    this._gameBoyController.onPointerUp(x, y);
  }

  onWheelScroll(delta) {
    this._gameBoyController.onWheelScroll(delta);
  }

  onSoundChanged() {
    this._gameBoyController.onUISoundIconChanged();
  }

  _init() {
    this._initGameBoy();
    this._initCartridgesController();
    this._initGameBoyGames();
    this._initGameBoyDebug();
    this._initCameraController();
    this._initBackground();
    this._configureRaycaster();
    this._initGameBoyController();
    this._initEmptySound();

    this._initSignals();
  }

  _initGameBoy() {
    const gameBoyPixiCanvas = this._data.gameBoyPixiApp.canvas;
    const gameBoyPixiApp = this._data.gameBoyPixiApp;
    const audioListener = this._data.audioListener;

    const gameBoy = new GameBoy(gameBoyPixiCanvas, gameBoyPixiApp, audioListener);
    this.add(gameBoy);

    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy] = gameBoy;
  }

  _initCartridgesController() {
    const cartridgesController = new CartridgesController();
    this.add(cartridgesController);

    this._activeObjects[SCENE_OBJECT_TYPE.Cartridges] = cartridgesController;
  }

  _initGameBoyGames() {
    const gameBoyPixiApp = this._data.gameBoyPixiApp;

    this._gameBoyGames = new GameBoyGames(gameBoyPixiApp);
  }

  _initGameBoyDebug() {
    this._gameBoyDebug = new GameBoyDebug();
  }

  _initCameraController() {
    this._cameraController = new CameraController(this._data.camera);
  }

  _initBackground() {
    const background = this._background = new Background();
    this.add(background);

    this._activeObjects[SCENE_OBJECT_TYPE.Background] = background;
  }

  _configureRaycaster() {
    const allMeshes = [];
    const gameBoy = this._activeObjects[SCENE_OBJECT_TYPE.GameBoy];
    const cartridges = this._activeObjects[SCENE_OBJECT_TYPE.Cartridges];

    allMeshes.push(...gameBoy.getAllMeshes());
    allMeshes.push(...cartridges.getAllMeshes());
    allMeshes.push(this._background.getMesh());

    this._data.raycasterController.addMeshes(allMeshes);
  }

  _initGameBoyController() {
    this._data.activeObjects = this._activeObjects;
    this._data.games = this._gameBoyGames;
    this._data.gameBoyDebug = this._gameBoyDebug;
    this._data.cameraController = this._cameraController;
    this._data.background = this._background;

    this._gameBoyController = new GameBoyController(this._data);
  }

  _initEmptySound() {
    if (SCENE_CONFIG.isMobile) {
      window.addEventListener('touchstart', () => {
        if (this._isSoundPlayed) {
          return;
        }

        const sound = new THREE.PositionalAudio(this._data.audioListener);
        sound.setVolume(0);
        sound.play();

        this._isSoundPlayed = true;
      });
    }
  }

  _initSignals() {
    this._gameBoyController.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
    this._gameBoyController.events.on('onSoundsEnabledChanged', () => this.events.post('onSoundsEnabledChanged'));
  }
}
