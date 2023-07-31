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
    this._gameBoyScene = null;

    this._init();
  }

  update(dt) {
    this._gameBoyScene.update(dt);
  }

  onPointerMove(x, y) {
    this._gameBoyScene.onPointerMove(x, y);
  }

  onPointerDown(x, y) {
    this._gameBoyScene.onPointerDown(x, y);
  }

  onPointerUp(x, y) {
    this._gameBoyScene.onPointerUp(x, y);
  }

  onPointerLeave() {
    this._gameBoyScene.onPointerLeave();
  }

  onWheelScroll(delta) {
    this._gameBoyScene.onWheelScroll(delta);
  }

  onSoundChanged() {
    this._gameBoyScene.onSoundChanged();
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
    const gameBoyScene = this._gameBoyScene = new GameBoyScene(this._data, this._raycasterController);
    this.add(gameBoyScene);
  }

  _initSignals() {
    this._gameBoyScene.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
    this._gameBoyScene.events.on('onSoundsEnabledChanged', () => this.events.post('onSoundsEnabledChanged'));
  }
}
