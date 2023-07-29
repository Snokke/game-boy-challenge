import * as THREE from 'three';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config';
import { MessageDispatcher } from 'black-engine';
import DEBUG_CONFIG from '../../../core/configs/debug-config';

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
    if (DEBUG_CONFIG.orbitControls) {
      return;
    }

    this._camera.position.lerp(this._zoomObject.position, dt * 60 * 0.04);
  }

  onWheelScroll(delta) {
    if (DEBUG_CONFIG.orbitControls) {
      return;
    }

    const zoomDelta = delta * 0.4;
    const minDistance = 3.2;
    const maxDistance = 6;

    this._zoomDistance += zoomDelta;
    this._zoomDistance = THREE.MathUtils.clamp(this._zoomDistance, minDistance, maxDistance);

    const cursorRotationCoeff = 3.2 - (THREE.MathUtils.clamp(this._zoomDistance, 3.2, 6) - 3.2);

    GAME_BOY_CONFIG.rotation.cursorRotationSpeed = 0.2 - (cursorRotationCoeff / 3.2) * 0.2;

    this._zoomObject.position.z = this._zoomDistance;
    this._zoomObject.position.y = (-this._zoomObject.position.z + 6 - 0.4) * 0.13;

    const zoomPercent = 1 - (this._zoomDistance - minDistance) / (maxDistance - minDistance);
    this.events.post('onZoom', zoomPercent);

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

    // for (let i = 0; i < 10; i++) {
    //   this.onWheelScroll(-1);
    // }
  }
}
