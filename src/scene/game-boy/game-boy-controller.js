export default class GameBoyController {
  constructor(data) {

    this._scene = data.scene;
    this._camera = data.camera;
    this._renderer = data.renderer;
    this._orbitControls = data.orbitControls;
    this._outlinePass = data.outlinePass;
    this._raycasterController = data.raycasterController;

    this._init();
  }

  update(dt) {
    if (dt > 0.1) {
      dt = 0.1;
    }
  }

  onPointerMove(x, y) {

  }

  onPointerDown(x, y) {

  }

  onPointerUp(x, y) {

  }

  onWheelScroll(delta) {

  }

  _init() {

  }
}
