import { EventEmitter } from 'pixi.js';
import UI from "./ui/ui";
import Scene3D from "./scene/scene3d";

export default class MainScene {
  constructor(data) {
    this.events = new EventEmitter();

    this._data = data;
    this._scene = data.scene;
    this._camera = data.camera;

    this._scene3D = null;
    this._ui = null;

    this._init();
  }

  onResize() {
    this._ui.onResize();
  }

  afterAssetsLoad() {
    this._data.pixiApp.stage.addChild(this._ui);
    this._scene.add(this._scene3D);
  }

  update(dt) {
    this._scene3D.update(dt);
  }

  _init() {
    this._scene3D = new Scene3D(this._data);
    this._ui = new UI(this._data.pixiApp);

    this._initSignals();
  }

  _initSignals() {
    this._ui.events.on('onPointerMove', (x, y) => this._scene3D.onPointerMove(x, y));
    this._ui.events.on('onPointerDown', (x, y) => this._scene3D.onPointerDown(x, y));
    this._ui.events.on('onPointerUp', (x, y) => this._scene3D.onPointerUp(x, y));
    this._ui.events.on('onWheelScroll', (delta) => this._scene3D.onWheelScroll(delta));
    this._ui.events.on('onSoundChanged', () => this._scene3D.onSoundChanged());

    this._scene3D.events.on('fpsMeterChanged', () => this.events.emit('fpsMeterChanged'));
    this._scene3D.events.on('onSoundsEnabledChanged', () => this._ui.updateSoundIcon());
  }
}
