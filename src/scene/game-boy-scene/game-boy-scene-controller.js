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
    this._cameraController = data.cameraController;
    this._background = data.background;

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
    this._cameraController.update(dt);

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

    if (intersectObject) {
      const sceneObjectType = intersectObject.userData.sceneObjectType;
      const activeObject = this._activeObjects[sceneObjectType];

      if (intersectObject.userData.isActive) {
        activeObject.onPointerDown(intersectObject);
      }

      if (intersectObject.userData.isDraggable) {
        this._dragPointerDownPosition.set(x, y);
        this._draggingObject = activeObject;
        this._draggingObject.onPointerDragDown();
      }
    }
  }

  onPointerUp(x, y) {
    if (this._draggingObject) {
      this._draggingObject.onDragPointerUp();
      this._draggingObject = null;
    }

    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].onPointerUp();
  }

  onWheelScroll(delta) {
    this._cameraController.onWheelScroll(delta);
  }

  _checkToGlow(intersect) {
    const object = intersect.object;

    if (object === null || !object.userData.isActive) {
      Black.engine.containerElement.style.cursor = 'auto';
      this._resetGlow();

      return;
    }

    if (object.userData.isActive && object.userData.showOutline) {
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
    const background = this._activeObjects[SCENE_OBJECT_TYPE.Background];

    gameBoy.events.on('onButtonPress', (msg, buttonType) => this._onButtonPress(buttonType));
    gameBoy.events.on('onPowerOn', () => this._games.onPowerOn());
    gameBoy.events.on('onPowerOff', () => this._games.onPowerOff());
    // cartridges.events.on('onCartridgeInsert', (msg, gameType) => gameBoy.onCartridgeInsert(gameType));

    background.events.on('onClick', () => gameBoy.onBackgroundClick());

    this._cameraController.events.on('onRotationDragDisabled', () => this._onRotationDragDisabled());
    this._cameraController.events.on('onRotationDragEnabled', () => this._gameBoyDebug.enableRotationDrag());
    this._gameBoyDebug.events.on('rotationCursorChanged', () => gameBoy.onDebugRotationChanged());
    this._gameBoyDebug.events.on('rotationDragChanged', () => gameBoy.onDebugRotationChanged());
  }

  _onRotationDragDisabled() {
    this._activeObjects[SCENE_OBJECT_TYPE.GameBoy].resetRotation();
    this._gameBoyDebug.disableRotationDrag();
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
