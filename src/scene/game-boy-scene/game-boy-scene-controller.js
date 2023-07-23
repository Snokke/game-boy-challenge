import { Black } from 'black-engine';
import * as THREE from 'three';

export default class GameBoyController {
  constructor(data) {

    this._scene = data.scene;
    this._camera = data.camera;
    this._renderer = data.renderer;
    this._orbitControls = data.orbitControls;
    this._outlinePass = data.outlinePass;
    this._raycasterController = data.raycasterController;
    this._activeObjects = data.activeObjects;

    this._pointerPosition = new THREE.Vector2();
    this._pointerPositionOnDown = new THREE.Vector2();
  }

  update(dt) {
    if (dt > 0.1) {
      dt = 0.1;
    }

    const intersect = this._raycasterController.checkIntersection(this._pointerPosition.x, this._pointerPosition.y);

    if (intersect === null) {
      Black.engine.containerElement.style.cursor = 'auto';
      this._resetGlow();
    }

    if (intersect && intersect.object) {
      this._checkToGlow(intersect);
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

  onWheelScroll(delta) {

  }
}
