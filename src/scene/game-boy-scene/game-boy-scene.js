import * as THREE from 'three';
import GameBoyController from './game-boy-scene-controller';
import GameBoy from './game-boy/game-boy';
import CartridgesController from './cartridges/cartridges-controller';
import { SCENE_OBJECT_TYPE } from './data/game-boy-scene-data';
import Games from './games/games';

export default class GameBoyScene extends THREE.Group {
  constructor(data, raycasterController) {
    super();

    this._data = data;
    this._data.raycasterController = raycasterController;

    this._gameBoyController = null;
    this._games = null;
    this._activeObjects = {};

    this._init();
  }

  update(dt) {
    if (dt > 0.1) {
      dt = 0.1;
    }

    this._gameBoyController.update(dt);
    this._games.update(dt);
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

  _init() {
    this._initGameBoy();
    this._initCartridgesController();
    this._initGames();
    this._configureRaycaster();
    this._initGameBoyController();
  }

  _initGameBoy() {
    const pixiCanvas = this._data.pixiApplication.view;

    const gameBoy = new GameBoy(pixiCanvas);
    this.add(gameBoy);

    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy] = gameBoy;
  }

  _initCartridgesController() {
    const cartridgesController = new CartridgesController();
    this.add(cartridgesController);

    this._activeObjects[SCENE_OBJECT_TYPE.Cartridges] = cartridgesController;
  }

  _initGames() {
    this._games = new Games(this._data.pixiApplication);
  }

  _configureRaycaster() {
    const allMeshes = [];
    const gameBoy = this._activeObjects[SCENE_OBJECT_TYPE.GameBoy];
    const cartridges = this._activeObjects[SCENE_OBJECT_TYPE.Cartridges];

    allMeshes.push(...gameBoy.getAllMeshes());
    allMeshes.push(...cartridges.getAllMeshes());

    this._data.raycasterController.addMeshes(allMeshes);
  }

  _initGameBoyController() {
    this._data.activeObjects = this._activeObjects;

    this._gameBoyController = new GameBoyController(this._data);
  }
}
