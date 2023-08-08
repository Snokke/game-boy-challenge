import * as THREE from 'three';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config';
import { MessageDispatcher } from 'black-engine';
import DEBUG_CONFIG from '../../../core/configs/debug-config';
import { CAMERA_CONTROLLER_CONFIG } from './camera-controller-config';
import SCENE_CONFIG from '../../../core/configs/scene-config';

export default class CameraController {
  constructor(camera) {

    this.events = new MessageDispatcher();

    this._camera = camera;

    this._zoomObject = new THREE.Object3D();
    this._rotationDragPreviousState = true;
    this._minDistance = SCENE_CONFIG.isMobile ? CAMERA_CONTROLLER_CONFIG.mobileMinDistance : CAMERA_CONTROLLER_CONFIG.minDistance;

    this._zoomDistance = this._camera.position.z;

    this._init();
  }

  update(dt) {
    if (DEBUG_CONFIG.orbitControls) {
      return;
    }

    this._camera.position.lerp(this._zoomObject.position, dt * 60 * 0.04);
    this._camera.quaternion.slerp(this._zoomObject.quaternion, dt * 60 * 0.04);
  }

  onWheelScroll(delta) {
    if (DEBUG_CONFIG.orbitControls) {
      return;
    }

    const zoomDelta = delta * CAMERA_CONTROLLER_CONFIG.zoomSpeed;
    const minDistance = this._minDistance;
    const maxDistance = CAMERA_CONTROLLER_CONFIG.maxDistance;

    this._zoomDistance += zoomDelta;
    this._zoomDistance = THREE.MathUtils.clamp(this._zoomDistance, minDistance, maxDistance);

    const cursorRotationCoeff = minDistance - (THREE.MathUtils.clamp(this._zoomDistance, minDistance, maxDistance) - minDistance);

    GAME_BOY_CONFIG.rotation.cursorRotationSpeed = 0.2 - (cursorRotationCoeff / minDistance) * 0.2;

    this._zoomObject.position.z = this._zoomDistance;
    this._zoomObject.position.y = (-this._zoomObject.position.z + maxDistance - 0.4) * 0.13;

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

      }
    }
  }

  zoomIn() {
    for (let i = 0; i < 10; i++) {
      this.onWheelScroll(-1);
    }
  }

  zoomOut() {
    for (let i = 0; i < 10; i++) {
      this.onWheelScroll(1);
    }
  }

  _init() {
    this._zoomObject.position.copy(this._camera.position);

    if (DEBUG_CONFIG.startState.zoomIn) {
      this.zoomIn();
    }
  }
}
