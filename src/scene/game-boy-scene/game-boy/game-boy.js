import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { GAME_BOY_PART_TYPE, GAME_BOY_ACTIVE_PARTS, GAME_BOY_CROSS_PARTS, BUTTON_TYPE, GAME_BOY_DRAGGABLE_PARTS } from './data/game-boy-data';
import Loader from '../../../core/loader';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';
import { GAME_BOY_BUTTONS_CONFIG, GAME_BOY_CONFIG, GAME_BOY_BUTTON_PART_BY_TYPE, CROSS_BUTTONS } from './data/game-boy-config';
import { MessageDispatcher } from 'black-engine';
import mixTextureColorVertexShader from './mix-texture-color-shaders/mix-texture-color-vertex.glsl';
import mixTextureColorFragmentShader from './mix-texture-color-shaders/mix-texture-color-fragment.glsl';
import mixTextureBitmapVertexShader from './mix-texture-bitmap-shaders/mix-texture-bitmap-vertex.glsl';
import mixTextureBitmapFragmentShader from './mix-texture-bitmap-shaders/mix-texture-bitmap-fragment.glsl';
import Delayed from '../../../core/helpers/delayed-call';

export default class GameBoy extends THREE.Group {
  constructor(pixiCanvas) {
    super();

    this.events = new MessageDispatcher();

    this._pixiCanvas = pixiCanvas;
    this._sceneObjectType = SCENE_OBJECT_TYPE.GameBoy;

    this._parts = [];
    this._allMeshes = [];
    this._crossMeshes = [];
    this._buttons = {};
    this._buttonTween = {};
    this._powerButtonTween = null;
    this._powerIndicatorTween = null;
    this._crossButtonsGroup = null;

    this._rotationObject = new THREE.Object3D();
    this._rotationQuaternion = new THREE.Quaternion();
    this._pointerPosition = new THREE.Vector2();
    this._isDefaultRotation = true;
    this._returnRotationTimer = null;

    this._isDragging = false;
    this._isIntroActive = GAME_BOY_CONFIG.intro.enabled;
    this._rotationLerpSpeed = GAME_BOY_CONFIG.rotation.standardLerpSpeed;

    this._init();
  }

  update(dt) {
    if (this._isIntroActive) {
      this.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), dt * 60 * GAME_BOY_CONFIG.intro.speed * 0.001);
    } else {
      this._rotationLerpSpeed = this._lerp(this._rotationLerpSpeed, GAME_BOY_CONFIG.rotation.standardLerpSpeed, dt * 60 * 0.02);
      this.quaternion.slerp(this._rotationObject.quaternion, dt * 60 * this._rotationLerpSpeed);
    }

    if (GAME_BOY_CONFIG.updateTexture) {
      this._parts[GAME_BOY_PART_TYPE.Screen].material.uniforms.uBitmapTexture.value.needsUpdate = true;
    }
  }

  onClick(object) {
    const objectPartType = object.userData['partType'];

    for (const buttonPart in GAME_BOY_BUTTON_PART_BY_TYPE) {
      const buttonType = GAME_BOY_BUTTON_PART_BY_TYPE[buttonPart];

      if (objectPartType === buttonPart) {
        this._pressDownButton(buttonType);
      }
    }

    if (objectPartType === GAME_BOY_PART_TYPE.PowerButton || objectPartType === GAME_BOY_PART_TYPE.PowerButtonFrame) {
      this._powerButtonSwitch();
      this._resetReturnRotationTimer();
    }
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);

    if (this._isDragging || !this._isDefaultRotation || !GAME_BOY_CONFIG.rotation.rotationCursorEnabled) {
      return;
    }

    const percentX = x / window.innerWidth * 2 - 1;
    const percentY = y / window.innerHeight * 2 - 1;

    this._rotationObject.quaternion.copy(this._rotationQuaternion);
    this._rotationObject.rotateOnAxis(new THREE.Vector3(0, 1, 0), (percentX) * GAME_BOY_CONFIG.rotation.cursorRotationSpeed);
    this._rotationObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), (percentY) * GAME_BOY_CONFIG.rotation.cursorRotationSpeed);
  }

  onPointerDragMove(dragX, dragY) {
    if (!GAME_BOY_CONFIG.rotation.rotationDragEnabled) {
      return;
    }

    this._rotationObject.quaternion.copy(this._rotationQuaternion);
    this._rotationObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -dragX * GAME_BOY_CONFIG.rotation.dragRotationSpeed * 0.001);
    this._rotationObject.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -dragY * GAME_BOY_CONFIG.rotation.dragRotationSpeed * 0.001);
  }

  onPointerDragDown() {
    if (!GAME_BOY_CONFIG.rotation.rotationDragEnabled) {
      return;
    }

    this._rotationQuaternion.copy(this.quaternion);

    this._isDragging = true;
    this._isDefaultRotation = false;

    this._stopReturnRotationTimer();
  }

  onPointerUp() {
    if (!GAME_BOY_CONFIG.rotation.rotationDragEnabled) {
      return;
    }

    this._isDragging = false;

    this._resetReturnRotationTimer();
  }

  onPointerOver(object) { }

  powerOn() {
    this._powerButtonOn();
  }

  disableIntro() {
    this._isIntroActive = false;
  }

  resetRotation() {
    this._rotationObject.quaternion.copy(new THREE.Quaternion());
    this._rotationQuaternion.copy(new THREE.Quaternion());
    this._isDefaultRotation = true;
    this._rotationLerpSpeed = GAME_BOY_CONFIG.rotation.slowLerpSpeed;
  }

  onDebugRotationChanged() {
    if (GAME_BOY_CONFIG.rotation.rotationCursorEnabled === false) {
      this._onReturnRotation();
    }
  }

  getAllMeshes() {
    return this._allMeshes;
  }

  getOutlineMeshes(object) {
    const partType = object.userData['partType'];

    if (GAME_BOY_CROSS_PARTS.includes(partType)) {
      return this._crossMeshes;
    }

    if (partType === GAME_BOY_PART_TYPE.PowerButton || partType === GAME_BOY_PART_TYPE.PowerButtonFrame) {
      const powerButton = this._parts[GAME_BOY_PART_TYPE.PowerButton];
      return [powerButton];
    }

    return [object];
  }

  _onReturnRotation() {
    this._rotationObject.quaternion.copy(new THREE.Quaternion());
    this._rotationQuaternion.copy(new THREE.Quaternion());
    this._isDefaultRotation = true;
    this._rotationLerpSpeed = GAME_BOY_CONFIG.rotation.slowLerpSpeed;

    this.onPointerMove(this._pointerPosition.x, this._pointerPosition.y);
  }

  _stopReturnRotationTimer() {
    if (this._returnRotationTimer) {
      this._returnRotationTimer.stop();
      this._returnRotationTimer = null;
    }
  }

  _setReturnRotationTimer() {
    this._returnRotationTimer = Delayed.call(GAME_BOY_CONFIG.rotation.returnTime, () => this._onReturnRotation());
  }

  _resetReturnRotationTimer() {
    this._stopReturnRotationTimer();
    this._setReturnRotationTimer();
  }

  _pressDownCrossButton(buttonType, autoPressUp = true) {
    const config = GAME_BOY_BUTTONS_CONFIG[buttonType];
    this._stopButtonTween(buttonType);

    const endAngle = config.rotateAngle * THREE.MathUtils.DEG2RAD;
    const time = Math.abs(this._crossButtonsGroup.rotation[config.rotateAxis] - endAngle) / (config.moveSpeed * 0.001);

    this._buttonTween[buttonType] = new TWEEN.Tween(this._crossButtonsGroup.rotation)
      .to({ [config.rotateAxis]: endAngle }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        if (autoPressUp) {
          this._pressUpCrossButton(buttonType);
        }
      });
  }

  _pressUpCrossButton(buttonType) {
    const config = GAME_BOY_BUTTONS_CONFIG[buttonType];
    this._stopButtonTween(buttonType);

    const time = Math.abs(this._crossButtonsGroup.rotation[config.rotateAxis]) / (config.moveSpeed * 0.001);

    this._buttonTween[buttonType] = new TWEEN.Tween(this._crossButtonsGroup.rotation)
      .to({ [config.rotateAxis]: 0 }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  _pressDownButton(buttonType, autoPressUp = true) {
    this.events.post('onButtonPress', buttonType);

    if (CROSS_BUTTONS.includes(buttonType)) {
      this._pressDownCrossButton(buttonType, autoPressUp);

      return;
    }

    const button = this._buttons[buttonType];
    this._stopButtonTween(buttonType);

    const config = GAME_BOY_BUTTONS_CONFIG[buttonType];

    const distance = Math.abs(button.position.z - (button.userData.startPosition.z - config.moveDistance));
    const time = distance / (config.moveSpeed * 0.001);

    this._buttonTween[buttonType] = new TWEEN.Tween(button.position)
      .to({ z: button.userData.startPosition.z - config.moveDistance }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        if (autoPressUp) {
          this._pressUpButton(buttonType);
        }
      });
  }

  _pressUpButton(buttonType) {
    if (CROSS_BUTTONS.includes(buttonType)) {
      this._pressUpCrossButton(buttonType);

      return;
    }

    const button = this._buttons[buttonType];
    this._stopButtonTween(buttonType);

    const config = GAME_BOY_BUTTONS_CONFIG[buttonType];

    const distance = Math.abs(button.position.z - button.userData.startPosition.z);
    const time = distance / (config.moveSpeed * 0.001);

    this._buttonTween[buttonType] = new TWEEN.Tween(button.position)
      .to({ z: button.userData.startPosition.z }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  _stopButtonTween(buttonType) {
    if (this._buttonTween[buttonType]) {
      this._buttonTween[buttonType].stop();
    }
  }

  _powerButtonSwitch() {
    if (GAME_BOY_CONFIG.powerOn) {
      this._powerButtonOff();
    } else {
      this._powerButtonOn();
    }
  }

  _powerButtonOn() {
    GAME_BOY_CONFIG.powerOn = true;
    this.events.post('onPowerOn');

    const powerIndicator = this._parts[GAME_BOY_PART_TYPE.PowerIndicator];
    const powerButton = this._parts[GAME_BOY_PART_TYPE.PowerButton];

    this._stopPowerButtonTween();

    const distance = Math.abs(powerButton.position.x - (powerButton.userData.startPosition.x + GAME_BOY_CONFIG.powerButton.moveDistance));
    const time = distance / (GAME_BOY_CONFIG.powerButton.moveSpeed * 0.001);

    this._powerButtonTween = new TWEEN.Tween(powerButton.position)
      .to({ x: powerButton.userData.startPosition.x + GAME_BOY_CONFIG.powerButton.moveDistance }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    const powerIndicatorObject = { value: powerIndicator.material.uniforms.uMixPercent.value };

    this._powerIndicatorTween = new TWEEN.Tween(powerIndicatorObject)
      .to({ value: 1 }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        powerIndicator.material.uniforms.uMixPercent.value = powerIndicatorObject.value;
      });
  }

  _powerButtonOff() {
    GAME_BOY_CONFIG.powerOn = false;
    this.events.post('onPowerOff');

    const powerIndicator = this._parts[GAME_BOY_PART_TYPE.PowerIndicator];
    const powerButton = this._parts[GAME_BOY_PART_TYPE.PowerButton];

    this._stopPowerButtonTween();

    const distance = Math.abs(powerButton.position.x - powerButton.userData.startPosition.x);
    const time = distance / (GAME_BOY_CONFIG.powerButton.moveSpeed * 0.001);

    this._powerButtonTween = new TWEEN.Tween(powerButton.position)
      .to({ x: powerButton.userData.startPosition.x }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    const powerIndicatorObject = { value: powerIndicator.material.uniforms.uMixPercent.value };

    this._powerIndicatorTween = new TWEEN.Tween(powerIndicatorObject)
      .to({ value: 0 }, time * 28)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(time * 2)
      .start()
      .onUpdate(() => {
        powerIndicator.material.uniforms.uMixPercent.value = powerIndicatorObject.value;
      });
  }

  _stopPowerButtonTween() {
    if (this._powerButtonTween) {
      this._powerButtonTween.stop();
    }

    if (this._powerIndicatorTween) {
      this._powerIndicatorTween.stop();
    }
  }

  _init() {
    this._initGameBoyParts();
    this._initButtons();
    this._initCrossGroup();
    this._addMaterials();
    this._initCrossMeshes();
    this._initInitialRotation();
    this._initKeyboardEvents();
  }

  _initGameBoyParts() {
    const gameBoyModel = Loader.assets['game-boy'].scene;

    for (const partName in GAME_BOY_PART_TYPE) {
      const partType = GAME_BOY_PART_TYPE[partName];
      const part = gameBoyModel.children.find(child => child.name === partType);

      part.userData['partType'] = partType;
      part.userData['sceneObjectType'] = this._sceneObjectType;
      part.userData['isActive'] = GAME_BOY_ACTIVE_PARTS.includes(partType);
      part.userData['isDraggable'] = GAME_BOY_DRAGGABLE_PARTS.includes(partType);
      part.userData['startPosition'] = part.position.clone();

      this._parts[partType] = part;
      this._allMeshes.push(part);
      this.add(part);
    }
  }

  _initButtons() {
    this._buttons[BUTTON_TYPE.A] = this._parts[GAME_BOY_PART_TYPE.ButtonA];
    this._buttons[BUTTON_TYPE.B] = this._parts[GAME_BOY_PART_TYPE.ButtonB];
    this._buttons[BUTTON_TYPE.Select] = this._parts[GAME_BOY_PART_TYPE.ButtonSelect];
    this._buttons[BUTTON_TYPE.Start] = this._parts[GAME_BOY_PART_TYPE.ButtonStart];
    this._buttons[BUTTON_TYPE.CrossLeft] = this._parts[GAME_BOY_PART_TYPE.ButtonCrossLeft];
    this._buttons[BUTTON_TYPE.CrossRight] = this._parts[GAME_BOY_PART_TYPE.ButtonCrossRight];
    this._buttons[BUTTON_TYPE.CrossUp] = this._parts[GAME_BOY_PART_TYPE.ButtonCrossUp];
    this._buttons[BUTTON_TYPE.CrossDown] = this._parts[GAME_BOY_PART_TYPE.ButtonCrossDown];
  }

  _initCrossGroup() {
    const crossButtonsGroup = this._crossButtonsGroup = new THREE.Group();
    this.add(crossButtonsGroup);

    const startPosition = this._buttons[BUTTON_TYPE.CrossLeft].userData.startPosition;
    crossButtonsGroup.position.copy(startPosition);

    CROSS_BUTTONS.forEach(buttonType => {
      const button = this._buttons[buttonType];
      crossButtonsGroup.add(button);

      button.position.set(0, 0, 0);
    });
  }

  _addMaterials() {
    this._addBakedMaterial();
    this._addPowerIndicatorMaterial();
    this._addScreenMaterial();
  }

  _addBakedMaterial() {
    const texture = Loader.assets['baked-game-boy'];
    texture.flipY = false;

    const bakedMaterial = new THREE.MeshBasicMaterial({
      map: texture,
    });

    this._allMeshes.forEach(mesh => {
      mesh.material = bakedMaterial;
    });
  }

  _addPowerIndicatorMaterial() {
    const texture = Loader.assets['baked-power-indicator'];
    texture.flipY = false;

    const bakedMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uColor: { value: new THREE.Color(GAME_BOY_CONFIG.powerButton.powerIndicatorColor) },
        uMixPercent: { value: 0 },
      },
      vertexShader: mixTextureColorVertexShader,
      fragmentShader: mixTextureColorFragmentShader,
    });

    const powerIndicator = this._parts[GAME_BOY_PART_TYPE.PowerIndicator];
    powerIndicator.material = bakedMaterial;
  }

  _addScreenMaterial() {
    const canvasTexture = new THREE.Texture(this._pixiCanvas);
    canvasTexture.flipY = false;

    const bakedTexture = Loader.assets['baked-screen-shadow'];
    bakedTexture.flipY = false;

    const material = new THREE.ShaderMaterial({
      uniforms:
      {
        uTexture: { value: bakedTexture },
        uBitmapTexture: { value: canvasTexture },
      },
      vertexShader: mixTextureBitmapVertexShader,
      fragmentShader: mixTextureBitmapFragmentShader,
    });

    const screen = this._parts[GAME_BOY_PART_TYPE.Screen];
    screen.material = material;
  }

  _initCrossMeshes() {
    CROSS_BUTTONS.forEach(buttonType => {
      const button = this._buttons[buttonType];
      this._crossMeshes.push(button);
    });
  }

  _initInitialRotation() {
    if (GAME_BOY_CONFIG.intro.enabled) {
      this.rotation.x = GAME_BOY_CONFIG.intro.rotationX * THREE.MathUtils.DEG2RAD;
    }
  }

  _initKeyboardEvents() {
    this._onPressDownSignal = this._onPressDownSignal.bind(this);
    this._onPressUpSignal = this._onPressUpSignal.bind(this);

    window.addEventListener("keydown", this._onPressDownSignal);
    window.addEventListener("keyup", this._onPressUpSignal);
  }

  _onPressDownSignal(e) {
    if (e.repeat) {
      return;
    }

    for (const value in BUTTON_TYPE) {
      const buttonType = BUTTON_TYPE[value];
      const keysCode = GAME_BOY_BUTTONS_CONFIG[buttonType].keyCode;

      if (keysCode && keysCode.includes(e.code)) {
        this._pressDownButton(buttonType, false);
      }
    }
  }

  _onPressUpSignal(e) {
    if (e.repeat) {
      return;
    }

    for (const value in BUTTON_TYPE) {
      const buttonType = BUTTON_TYPE[value];
      const keysCode = GAME_BOY_BUTTONS_CONFIG[buttonType].keyCode;

      if (keysCode && keysCode.includes(e.code)) {
        this._pressUpButton(buttonType, false);
      }
    }
  }

  _lerp(from, to, t) {
    return from + (to - from) * t;
  }
}
