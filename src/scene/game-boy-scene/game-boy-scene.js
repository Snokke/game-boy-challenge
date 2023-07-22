import * as THREE from 'three';
import GameBoyController from './game-boy-scene-controller';
import GameBoy from './game-boy/game-boy';
import CartridgesController from './cartridges/cartridges-controller';
import { SCENE_OBJECT_TYPE } from './data/game-boy-scene-data';

export default class GameBoyScene extends THREE.Group {
  constructor(data, raycasterController) {
    super();

    this._data = data;
    this._data.raycasterController = raycasterController;

    this._gameBoyController = null;
    this._activeObjects = {};

    this._init();
  }

  update(dt) {
    this._gameBoyController.update(dt);
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
    this._configureRaycaster();
    this._initGameBoyController();
  }

  _initGameBoy() {
    const gameBoy = new GameBoy();
    this.add(gameBoy);

    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy] = gameBoy;
  }

  _initCartridgesController() {
    const cartridgesController = new CartridgesController();
    this.add(cartridgesController);

    this._activeObjects[SCENE_OBJECT_TYPE.Cartridges] = cartridgesController;
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
