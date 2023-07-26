import * as THREE from 'three';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config';
import { MessageDispatcher } from 'black-engine';

export default class CameraController {
  constructor(camera) {

    this.events = new MessageDispatcher();

    this._camera = camera;

    this._zoomObject = new THREE.Object3D();
    this._rotationDragPreviousState = true;

    this._zoomDistance = this._camera.position.z;

    this._init();
  }

  update(dt) {
    this._camera.position.lerp(this._zoomObject.position, dt * 60 * 0.04);
  }

  onWheelScroll(delta) {
    const zoomDelta = delta * 0.4;
    const minDistance = 3;
    const maxDistance = 6;
    this._zoomDistance = THREE.MathUtils.clamp(this._zoomDistance + zoomDelta, minDistance, maxDistance);

    const cursorRotationCoeff = 3 - (THREE.MathUtils.clamp(this._zoomDistance, 3, 6) - 3);

    GAME_BOY_CONFIG.rotation.cursorRotationSpeed = 0.2 - (cursorRotationCoeff / 3) * 0.2;

    if (this._zoomDistance !== minDistance && this._zoomDistance !== maxDistance) {
      this._zoomObject.position.z = this._zoomDistance;
      this._zoomObject.position.y = (-this._zoomObject.position.z + 6 - 0.4) * 0.13;
    }

    if (cursorRotationCoeff > GAME_BOY_CONFIG.rotation.zoomThresholdToDisableRotation) {
      GAME_BOY_CONFIG.rotation.rotationDragEnabled = false;

      if (this._rotationDragPreviousState !== GAME_BOY_CONFIG.rotation.rotationDragEnabled) {
        this._rotationDragPreviousState = GAME_BOY_CONFIG.rotation.rotationDragEnabled;

        this.events.post('onRotationDragDisabled');
      }
    } else {
      GAME_BOY_CONFIG.rotation.rotationDragEnabled = true;

      if (this._rotationDragPreviousState !== GAME_BOY_CONFIG.rotation.rotationDragEnabled) {
        this._rotationDragPreviousState = GAME_BOY_CONFIG.rotation.rotationDragEnabled;

        this.events.post('onRotationDragEnabled');
      }
    }
  }

  _init() {
    this._zoomObject.position.copy(this._camera.position);
  }
}
