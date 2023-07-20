import * as THREE from 'three';
import GameBoyController from './game-boy-controller';
import Loader from '../../core/loader';

export default class GameBoy extends THREE.Group {
  constructor(data, raycasterController) {
    super();

    this._data = data;
    this._data.raycasterController = raycasterController;

    this._gameBoyController = null;

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
    this._initGameBoyParts();
    this._configureRaycaster();
    this._initGameBoyController();
  }

  _initGameBoyParts() {
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, material);
    this.add(cube);
  }

  _configureRaycaster() {

  }

  _initGameBoyController() {
    this._gameBoyController = new GameBoyController(this._data);
  }
}
