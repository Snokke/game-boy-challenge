import * as THREE from 'three';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config';
import { EventEmitter } from 'pixi.js';
import { CAMERA_CONTROLLER_CONFIG } from './camera-controller-config';
import SCENE_CONFIG from '../../../Data/Configs/Main/scene-config';
import DEBUG_CONFIG from '../../../Data/Configs/Main/debug-config';

export default class CameraController {
  public events: EventEmitter;

  private camera: THREE.PerspectiveCamera;
  private zoomObject: THREE.Object3D;
  private rotationDragPreviousState: boolean;
  private minDistance: number;
  private zoomDistance: number;

  constructor(camera: THREE.PerspectiveCamera) {

    this.events = new EventEmitter();

    this.camera = camera;

    this.zoomObject = new THREE.Object3D();
    this.rotationDragPreviousState = true;
    this.minDistance = SCENE_CONFIG.isMobile ? CAMERA_CONTROLLER_CONFIG.mobileMinDistance : CAMERA_CONTROLLER_CONFIG.minDistance;

    this.zoomDistance = this.camera.position.z;

    this.init();
  }

  public update(dt: number): void {
    if (DEBUG_CONFIG.orbitControls) {
      return;
    }

    this.camera.position.lerp(this.zoomObject.position, dt * 60 * 0.04);
    this.camera.quaternion.slerp(this.zoomObject.quaternion, dt * 60 * 0.04);
  }

  public onWheelScroll(delta: number): void {
    if (DEBUG_CONFIG.orbitControls) {
      return;
    }

    const zoomDelta: number = delta * CAMERA_CONTROLLER_CONFIG.zoomSpeed;
    const minDistance: number = this.minDistance;
    const maxDistance: number = CAMERA_CONTROLLER_CONFIG.maxDistance;

    this.zoomDistance += zoomDelta;
    this.zoomDistance = THREE.MathUtils.clamp(this.zoomDistance, minDistance, maxDistance);

    const cursorRotationCoeff: number = minDistance - (THREE.MathUtils.clamp(this.zoomDistance, minDistance, maxDistance) - minDistance);

    GAME_BOY_CONFIG.rotation.cursorRotationSpeed = 0.2 - (cursorRotationCoeff / minDistance) * 0.2;

    this.zoomObject.position.z = this.zoomDistance;
    this.zoomObject.position.y = (-this.zoomObject.position.z + maxDistance - 0.4) * 0.13;

    const zoomPercent: number = 1 - (this.zoomDistance - minDistance) / (maxDistance - minDistance);
    this.events.emit('onZoom', zoomPercent);

    if (cursorRotationCoeff > GAME_BOY_CONFIG.rotation.zoomThresholdToDisableRotation) {
      GAME_BOY_CONFIG.rotation.rotationDragEnabled = false;

      if (this.rotationDragPreviousState !== GAME_BOY_CONFIG.rotation.rotationDragEnabled) {
        this.rotationDragPreviousState = GAME_BOY_CONFIG.rotation.rotationDragEnabled;

        this.events.emit('onRotationDragDisabled');
      }
    } else {
      GAME_BOY_CONFIG.rotation.rotationDragEnabled = true;

      if (this.rotationDragPreviousState !== GAME_BOY_CONFIG.rotation.rotationDragEnabled) {
        this.rotationDragPreviousState = GAME_BOY_CONFIG.rotation.rotationDragEnabled;

      }
    }
  }

  public zoomIn(): void {
    for (let i = 0; i < 10; i++) {
      this.onWheelScroll(-1);
    }
  }

  public zoomOut(): void {
    for (let i = 0; i < 10; i++) {
      this.onWheelScroll(1);
    }
  }

  private init(): void {
    this.zoomObject.position.copy(this.camera.position);

    if (DEBUG_CONFIG.startState.zoomIn) {
      this.zoomIn();
    }
  }
}
