import { Black } from 'black-engine';
import * as THREE from 'three';
import { SCENE_OBJECT_TYPE } from './data/game-boy-scene-data';
import { GAME_BOY_CONFIG } from './game-boy/data/game-boy-config';

export default class GameBoyController {
  constructor(data) {

    this._scene = data.scene;
    this._camera = data.camera;
    this._renderer = data.renderer;
    this._orbitControls = data.orbitControls;
    this._outlinePass = data.outlinePass;
    this._raycasterController = data.raycasterController;
    this._activeObjects = data.activeObjects;
    this._games = data.games;

    this._pointerPosition = new THREE.Vector2();
    this._pointerPositionOnDown = new THREE.Vector2();

    this._init();
  }

  update(dt) {
    const intersect = this._raycasterController.checkIntersection(this._pointerPosition.x, this._pointerPosition.y);

    if (intersect === null) {
      Black.engine.containerElement.style.cursor = 'auto';
      this._resetGlow();
    }

    if (intersect && intersect.object) {
      this._checkToGlow(intersect);
    }

    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].update(dt);
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);
  }

  onPointerDown(x, y) {
    this._pointerPositionOnDown.set(x, y);
  }

  onPointerUp(x, y) {
    const pixelsError = 2;
    const isCursorMoved = Math.abs(Math.round(this._pointerPositionOnDown.x) - Math.round(x)) <= pixelsError
      && Math.abs(Math.round(this._pointerPositionOnDown.y) - Math.round(y)) <= pixelsError;

    if (isCursorMoved) {
      this._onPointerClick(x, y);
    }
  }

  onWheelScroll(delta) {

  }

  _onPointerClick(x, y) {
    const intersect = this._raycasterController.checkIntersection(x, y);

    if (!intersect) {
      return;
    }

    const intersectObject = intersect.object;

    if (intersectObject && intersectObject.userData.isActive) {
      const sceneObjectType = intersectObject.userData.sceneObjectType;

      this._activeObjects[sceneObjectType].onClick(intersectObject);
    }
  }

  _checkToGlow(intersect) {
    const object = intersect.object;

    if (object === null || !object.userData.isActive) {
      Black.engine.containerElement.style.cursor = 'auto';
      this._resetGlow();

      return;
    }

    if (object.userData.isActive) {
      Black.engine.containerElement.style.cursor = 'pointer';

      const sceneObjectType = object.userData.sceneObjectType;
      const meshes = this._activeObjects[sceneObjectType].getOutlineMeshes(object);

      this._setGlow(meshes);
    }
  }

  _resetGlow() {
    this._outlinePass.selectedObjects = [];
  }

  _setGlow(meshes) {
    this._outlinePass.selectedObjects = meshes;
  }

  _powerOn() {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOn();
  }

  _init() {
    this._initSignals();
    this._initStartPowerState();
  }

  _initStartPowerState() {
    if (GAME_BOY_CONFIG.powerOn) {
      this._powerOn();
    }
  }

  _initSignals() {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].events.on('onButtonPress', (msg, buttonType) => this._onButtonPress(buttonType));
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].events.on('onPowerOn', () => this._games.onPowerOn());
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].events.on('onPowerOff', () => this._games.onPowerOff());
  }

  _onButtonPress(buttonType) {
    this._games.onButtonPress(buttonType);
  }
}
