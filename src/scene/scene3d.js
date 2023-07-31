import * as THREE from 'three';
import RaycasterController from './raycaster-controller';
import { MessageDispatcher } from 'black-engine';
import GameBoyScene from './game-boy-scene/game-boy-scene';

export default class Scene3D extends THREE.Group {
  constructor(data) {
    super();

    this.events = new MessageDispatcher();

    this._data = data,
    this._scene = data.scene,
    this._camera = data.camera,

    this._raycasterController = null;
    this._gameBoy = null;

    this._init();
  }

  update(dt) {
    this._gameBoy.update(dt);
  }

  onPointerMove(x, y) {
    this._gameBoy.onPointerMove(x, y);
  }

  onPointerDown(x, y) {
    this._gameBoy.onPointerDown(x, y);
  }

  onPointerUp(x, y) {
    this._gameBoy.onPointerUp(x, y);
  }

  onPointerLeave() {
    this._gameBoy.onPointerLeave();
  }

  onWheelScroll(delta) {
    this._gameBoy.onWheelScroll(delta);
  }

  _init() {
    this._initRaycaster();
    this._initGameBoy();
    this._initSignals();
  }

  _initRaycaster() {
    this._raycasterController = new RaycasterController(this._camera);
  }

  _initGameBoy() {
    const gameBoy = this._gameBoy = new GameBoyScene(this._data, this._raycasterController);
    this.add(gameBoy);
  }

  _initSignals() {
    this._gameBoy.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
  }
}
