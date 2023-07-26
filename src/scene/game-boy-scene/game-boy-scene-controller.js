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
    this._gameBoyDebug = data.gameBoyDebug;
    this._games = data.games;

    this._pointerPosition = new THREE.Vector2();
    this._pointerPositionOnDown = new THREE.Vector2();
    this._dragPointerDownPosition = new THREE.Vector2();
    this._draggingObject = null;

    this._isIntroActive = GAME_BOY_CONFIG.intro.enabled;

    this._init();
  }

  update(dt) {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].update(dt);
    this._activeObjects[SCENE_OBJECT_TYPE.Cartridges].update(dt);

    if (this._isIntroActive) {
      return;
    }

    const intersect = this._raycasterController.checkIntersection(this._pointerPosition.x, this._pointerPosition.y);

    if (intersect === null) {
      Black.engine.containerElement.style.cursor = 'auto';
      this._resetGlow();
    }

    if (intersect && intersect.object && !this._draggingObject) {
      this._checkToGlow(intersect);
    }
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].onPointerMove(x, y);

    if (this._draggingObject) {
      const deltaX = this._dragPointerDownPosition.x - x;
      const deltaY = this._dragPointerDownPosition.y - y;
      this._draggingObject.onPointerDragMove(deltaX, deltaY);
    }
  }

  onPointerDown(x, y) {
    this._pointerPositionOnDown.set(x, y);

    const intersect = this._raycasterController.checkIntersection(x, y);

    if (!intersect) {
      return;
    }

    const intersectObject = intersect.object;

    if (intersectObject && intersectObject.userData.isDraggable) {
      this._dragPointerDownPosition.set(x, y);
      const sceneObjectType = intersectObject.userData.sceneObjectType;
      this._draggingObject = this._activeObjects[sceneObjectType];
      this._draggingObject.onPointerDragDown();
    }
  }

  onPointerUp(x, y) {
    const pixelsError = 2;
    const isCursorMoved = Math.abs(Math.round(this._pointerPositionOnDown.x) - Math.round(x)) <= pixelsError
      && Math.abs(Math.round(this._pointerPositionOnDown.y) - Math.round(y)) <= pixelsError;

    if (this._draggingObject === null && isCursorMoved) {
      this._onPointerClick(x, y);
    }

    if (this._draggingObject) {
      this._draggingObject.onPointerUp();
      this._draggingObject = null;
    }
  }

  onWheelScroll(delta) {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].onWheelScroll(delta);
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
      this._activeObjects[sceneObjectType].onPointerOver(object);

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
    this._initIntroSignal();

    const gameBoy = this._activeObjects[SCENE_OBJECT_TYPE.GameBoy];
    const cartridges = this._activeObjects[SCENE_OBJECT_TYPE.Cartridges];

    gameBoy.events.on('onButtonPress', (msg, buttonType) => this._onButtonPress(buttonType));
    gameBoy.events.on('onPowerOn', () => this._games.onPowerOn());
    gameBoy.events.on('onPowerOff', () => this._games.onPowerOff());
    gameBoy.events.on('onRotationDragDisabled', () => this._gameBoyDebug.disableRotationDrag());
    gameBoy.events.on('onRotationDragEnabled', () => this._gameBoyDebug.enableRotationDrag());
    // cartridges.events.on('onCartridgeInsert', (msg, gameType) => gameBoy.onCartridgeInsert(gameType));

    this._gameBoyDebug.events.on('rotationCursorChanged', () => gameBoy.onDebugRotationChanged());
    this._gameBoyDebug.events.on('rotationDragChanged', () => gameBoy.onDebugRotationChanged());
  }

  _initIntroSignal() {
    window.addEventListener('pointerdown', () => {
      if (this._isIntroActive) {
        this._isIntroActive = false;
        this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableIntro();
      }
    });
  }

  _onButtonPress(buttonType) {
    this._games.onButtonPress(buttonType);
  }
}
