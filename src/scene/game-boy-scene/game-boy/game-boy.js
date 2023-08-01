import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { GAME_BOY_PART_TYPE, GAME_BOY_ACTIVE_PARTS, GAME_BOY_CROSS_PARTS, BUTTON_TYPE, GAME_BOY_DRAGGABLE_PARTS } from './data/game-boy-data';
import Loader from '../../../core/loader';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';
import { GAME_BOY_BUTTONS_CONFIG, GAME_BOY_CONFIG, GAME_BOY_BUTTON_PART_BY_TYPE, CROSS_BUTTONS } from './data/game-boy-config';
import { Black, MessageDispatcher } from 'black-engine';
import mixTextureColorVertexShader from './mix-texture-color-shaders/mix-texture-color-vertex.glsl';
import mixTextureColorFragmentShader from './mix-texture-color-shaders/mix-texture-color-fragment.glsl';
import mixTextureBitmapVertexShader from './mix-texture-bitmap-shaders/mix-texture-bitmap-vertex.glsl';
import mixTextureBitmapFragmentShader from './mix-texture-bitmap-shaders/mix-texture-bitmap-fragment.glsl';
import Delayed from '../../../core/helpers/delayed-call';
import DEBUG_CONFIG from '../../../core/configs/debug-config';
import { SOUNDS_CONFIG } from '../../../core/configs/sounds-config';
import GameBoyAudio from './game-boy-audio/game-boy-audio';
import SCENE_CONFIG from '../../../core/configs/scene-config';

export default class GameBoy extends THREE.Group {
  constructor(pixiCanvas, audioListener) {
    super();

    this.events = new MessageDispatcher();

    this._pixiCanvas = pixiCanvas;
    this._audioListener = audioListener;
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
    this._draggingObjectType = null;
    this._pressedButtonType = null;
    this._isIntroActive = GAME_BOY_CONFIG.intro.enabled;
    this._rotationLerpSpeed = GAME_BOY_CONFIG.rotation.standardLerpSpeed;
    this._buttonRepeatTime = 0;
    this._firstRepeatTimer = null;
    this._buttonRepeatAllowed = false;

    this._globalVolume = SOUNDS_CONFIG.masterVolume;
    this._isSoundsEnabled = true;
    this._powerSwitchSound = null;
    this._insertCartridgeSound = null;
    this._ejectCartridgeSound = null;

    this._zeldaIntroVideo = null;
    this._isZeldaIntroPlaying = false;

    this._isMobileZoomIn = false;
    this._draggableParts = SCENE_CONFIG.isMobile ? GAME_BOY_DRAGGABLE_PARTS : [...GAME_BOY_DRAGGABLE_PARTS, GAME_BOY_PART_TYPE.Screen];
    this._dragRotationSpeed = SCENE_CONFIG.isMobile ? GAME_BOY_CONFIG.rotation.mobileDragRotationSpeed : GAME_BOY_CONFIG.rotation.dragRotationSpeed;

    this._updateSkipAllowed = SCENE_CONFIG.isMobile;
    this._updateScreenSkipFrames = 2;
    this._updateScreenCounter = this._updateScreenSkipFrames;

    this._init();
  }

  update(dt) {
    this._updateRotation(dt);
    this._updateScreenTexture();
    this._updateButtonsRepeat(dt);
  }

  onPointerDown(object) {
    const objectPartType = object.userData['partType'];

    for (const buttonPart in GAME_BOY_BUTTON_PART_BY_TYPE) {
      const buttonType = GAME_BOY_BUTTON_PART_BY_TYPE[buttonPart];

      if (objectPartType === buttonPart) {
        this._pressDownButton(buttonType);
      }
    }

    if (SCENE_CONFIG.isMobile && objectPartType === GAME_BOY_PART_TYPE.Screen) {
      const credits = document.querySelector('.credits');

      if (this._isMobileZoomIn) {
        this._isMobileZoomIn = false;
        this.events.post('onZoomOut');

        credits.classList.remove('hide');
        credits.classList.add('show');
      } else {
        this._isMobileZoomIn = true;
        this.events.post('onZoomIn');

        credits.classList.remove('show');
        credits.classList.add('hide');
      }
    }

    if (objectPartType === GAME_BOY_PART_TYPE.PowerButton || objectPartType === GAME_BOY_PART_TYPE.PowerButtonFrame) {
      this.powerButtonSwitch();
      this._resetReturnRotationTimer();
    }
  }

  onPointerUp() {
    if (!this._pressedButtonType) {
      return;
    }

    this._pressUpButton(this._pressedButtonType);
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);

    if (this._isDragging || !this._isDefaultRotation || !GAME_BOY_CONFIG.rotation.rotationCursorEnabled || !GAME_BOY_CONFIG.rotation.debugRotationCursorEnabled || SCENE_CONFIG.isMobile) {
      return;
    }

    const percentX = x / window.innerWidth * 2 - 1;
    const percentY = y / window.innerHeight * 2 - 1;

    this._rotationObject.quaternion.copy(this._rotationQuaternion);
    this._rotationObject.rotateOnAxis(new THREE.Vector3(0, 1, 0), (percentX) * GAME_BOY_CONFIG.rotation.cursorRotationSpeed);
    this._rotationObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), (percentY) * GAME_BOY_CONFIG.rotation.cursorRotationSpeed);
  }

  onPointerDragMove(dragX, dragY) {
    if (this._draggingObjectType === GAME_BOY_PART_TYPE.VolumeControl) {
      const volumeControl = this._parts[GAME_BOY_PART_TYPE.VolumeControl];
      const maxAngle = GAME_BOY_CONFIG.volumeController.maxAngle * THREE.MathUtils.DEG2RAD;
      volumeControl.rotation.z = volumeControl.rotationZ + dragY * GAME_BOY_CONFIG.volumeController.sensitivity;

      if (volumeControl.rotation.z < -maxAngle) {
        volumeControl.rotation.z = -maxAngle;
      }

      if (volumeControl.rotation.z > maxAngle) {
        volumeControl.rotation.z = maxAngle;
      }

      SOUNDS_CONFIG.gameBoyVolume = (volumeControl.rotation.z + maxAngle) / (maxAngle * 2);
      this.events.post('onGameBoyVolumeChanged');
    }


    if (this._draggableParts.includes(this._draggingObjectType) && GAME_BOY_CONFIG.rotation.rotationDragEnabled && GAME_BOY_CONFIG.rotation.debugRotationDragEnabled) {
      this._rotationObject.quaternion.copy(this._rotationQuaternion);
      this._rotationObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -dragX * this._dragRotationSpeed * 0.001);
      this._rotationObject.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -dragY * this._dragRotationSpeed * 0.001);
    }
  }

  onPointerDragDown(object) {
    const objectPartType = object.userData['partType'];

    if (objectPartType === GAME_BOY_PART_TYPE.VolumeControl) {
      this._isDragging = true;
      this._draggingObjectType = objectPartType;
      this._stopReturnRotationTimer();
    }

    if (this._draggableParts.includes(objectPartType) && GAME_BOY_CONFIG.rotation.rotationDragEnabled && GAME_BOY_CONFIG.rotation.debugRotationDragEnabled) {
      this._rotationQuaternion.copy(this.quaternion);

      this._isDragging = true;
      this._draggingObjectType = objectPartType;
      this._isDefaultRotation = false;

      this._stopReturnRotationTimer();
    }
  }

  onDragPointerUp() {
    if (!GAME_BOY_CONFIG.rotation.rotationDragEnabled || !GAME_BOY_CONFIG.rotation.debugRotationDragEnabled) {
      return;
    }

    this._isDragging = false;
    this._draggingObjectType = null;

    const volumeControl = this._parts[GAME_BOY_PART_TYPE.VolumeControl];
    volumeControl.rotationZ = volumeControl.rotation.z;

    this._resetReturnRotationTimer();
  }

  updateVolumeControlRotation() {
    if (this._draggingObjectType === GAME_BOY_PART_TYPE.VolumeControl) {
      return;
    }

    const maxAngle = GAME_BOY_CONFIG.volumeController.maxAngle * THREE.MathUtils.DEG2RAD;
    const volumeControl = this._parts[GAME_BOY_PART_TYPE.VolumeControl];

    volumeControl.rotation.z = SOUNDS_CONFIG.gameBoyVolume * (maxAngle * 2) - maxAngle;
    volumeControl.rotationZ = volumeControl.rotation.z;
  }

  onBackgroundClick() {
    this._onReturnRotation();
  }

  onPointerOver(object) {
    const objectPartType = object.userData['partType'];

    if ((this._draggableParts.includes(objectPartType) && GAME_BOY_CONFIG.rotation.rotationDragEnabled && GAME_BOY_CONFIG.rotation.debugRotationDragEnabled)
      || (objectPartType === GAME_BOY_PART_TYPE.VolumeControl)) {
      Black.engine.containerElement.style.cursor = 'grab';
    }
  }

  powerButtonSwitch() {
    if (GAME_BOY_CONFIG.powerOn) {
      this._powerButtonOff();
    } else {
      this._powerButtonOn();
    }
  }

  powerOn() {
    this._powerButtonOn();
  }

  powerOff() {
    this._powerButtonOff();
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

  resetRotationFast() {
    this._rotationObject.quaternion.copy(new THREE.Quaternion());
    this._rotationQuaternion.copy(new THREE.Quaternion());
    this._isDefaultRotation = true;
    this._rotationLerpSpeed = GAME_BOY_CONFIG.rotation.fastLerpSpeed;
  }

  disableRotation() {
    GAME_BOY_CONFIG.rotation.rotationCursorEnabled = false;
    GAME_BOY_CONFIG.rotation.rotationDragEnabled = false;
  }

  enableRotation() {
    GAME_BOY_CONFIG.rotation.rotationCursorEnabled = true;
    GAME_BOY_CONFIG.rotation.rotationDragEnabled = true;
  }

  addCartridge(cartridge) {
    this._cartridge = cartridge;
    this.add(this._cartridge);
  }

  onDebugRotationChanged() {
    if (GAME_BOY_CONFIG.rotation.debugRotationCursorEnabled === false) {
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

  onVolumeChanged(volume) {
    this._globalVolume = volume;

    if (this._isSoundsEnabled) {
      this._powerSwitchSound.setVolume(this._globalVolume);
      this._insertCartridgeSound.setVolume(this._globalVolume);
      this._ejectCartridgeSound.setVolume(this._globalVolume);
    }

    GameBoyAudio.changeGlobalVolume(volume);
  }

  enableSound() {
    this._isSoundsEnabled = true;

    this._powerSwitchSound.setVolume(this._globalVolume);
    this._insertCartridgeSound.setVolume(this._globalVolume);
    this._ejectCartridgeSound.setVolume(this._globalVolume);

    GameBoyAudio.enableSound();
  }

  disableSound() {
    this._isSoundsEnabled = false;

    this._powerSwitchSound.setVolume(0);
    this._insertCartridgeSound.setVolume(0);
    this._ejectCartridgeSound.setVolume(0);

    GameBoyAudio.disableSound();
  }

  playCartridgeInsertSound() {
    this._playSound(this._insertCartridgeSound);
  }

  playCartridgeEjectSound() {
    this._playSound(this._ejectCartridgeSound);
  }

  setCartridgePocketStandardTexture() {
    const cartridgePocket = this._parts[GAME_BOY_PART_TYPE.CartridgePocket];
    cartridgePocket.material.map = this._cartridgePocketStandardTexture;
  }

  setCartridgePocketWithCartridgeTexture() {
    const cartridgePocket = this._parts[GAME_BOY_PART_TYPE.CartridgePocket];
    cartridgePocket.material.map = this._cartridgePocketWithCartridgeTexture;
  }

  showZeldaIntro() {
    this._isZeldaIntroPlaying = true;
    GAME_BOY_CONFIG.updateTexture = false;

    const screen = this._parts[GAME_BOY_PART_TYPE.Screen];
    screen.material.uniforms.uBitmapTexture.value = this._zeldaVideoTexture;

    this._zeldaIntroVideo.play();
  }

  _updateRotation(dt) {
    if (DEBUG_CONFIG.orbitControls) {
      return;
    }

    if (this._isIntroActive) {
      this.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), dt * 60 * GAME_BOY_CONFIG.intro.speed * 0.001);
    } else {
      this._rotationLerpSpeed = this._lerp(this._rotationLerpSpeed, GAME_BOY_CONFIG.rotation.standardLerpSpeed, dt * 60 * 0.02);
      this.quaternion.slerp(this._rotationObject.quaternion, dt * 60 * this._rotationLerpSpeed);
    }
  }

  _updateScreenTexture() {
    if (GAME_BOY_CONFIG.updateTexture) {
      if (this._updateSkipAllowed) {
        if (this._updateScreenCounter >= this._updateScreenSkipFrames) {
          this._parts[GAME_BOY_PART_TYPE.Screen].material.uniforms.uBitmapTexture.value.needsUpdate = true;
          this._updateScreenCounter = 0;
        }

        this._updateScreenCounter += 1;
      } else {
        this._parts[GAME_BOY_PART_TYPE.Screen].material.uniforms.uBitmapTexture.value.needsUpdate = true;
      }

      if (!GAME_BOY_CONFIG.powerOn) {
        GAME_BOY_CONFIG.updateTexture = false;
      }
    }
  }

  _updateButtonsRepeat(dt) {
    if (this._pressedButtonType && this._buttonRepeatAllowed) {
      this._buttonRepeatTime += dt;

      if (this._buttonRepeatTime >= GAME_BOY_CONFIG.buttons.repeatTime) {
        this.events.post('onButtonPress', this._pressedButtonType);
        this._buttonRepeatTime = 0;
      }
    }
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

  _pressDownCrossButton(buttonType, autoPressUp = false) {
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

  _pressDownButton(buttonType, autoPressUp = false) {
    this._pressedButtonType = buttonType;
    this.events.post('onButtonPress', buttonType);

    if (GAME_BOY_BUTTONS_CONFIG[buttonType].keyRepeat) {
      this._firstRepeatTimer = Delayed.call(GAME_BOY_CONFIG.buttons.firstRepeatTime, () => {
        this._buttonRepeatAllowed = true;
      });
    }

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
    this.events.post('onButtonUp', buttonType);
    this._pressedButtonType = null;
    this._buttonRepeatAllowed = false;
    this._stopFirstRepeatTimer();

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

  _stopFirstRepeatTimer() {
    if (this._firstRepeatTimer) {
      this._firstRepeatTimer.stop();
    }
  }

  _powerButtonOn() {
    if (GAME_BOY_CONFIG.powerOn) {
      return;
    }

    GameBoyAudio.onTurnOnGameBoy();

    this._playSound(this._powerSwitchSound);
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
    if (GAME_BOY_CONFIG.powerOn === false) {
      return;
    }

    if (this._isZeldaIntroPlaying) {
      this._onZeldaIntroEnded();
    }

    GameBoyAudio.onTurnOffGameBoy();

    this._playSound(this._powerSwitchSound);
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

  _onZeldaIntroEnded() {
    this._isZeldaIntroPlaying = false;
    GAME_BOY_CONFIG.updateTexture = true;

    const screen = this._parts[GAME_BOY_PART_TYPE.Screen];
    screen.material.uniforms.uBitmapTexture.value = this._canvasTexture;

    this._zeldaIntroVideo.pause();
    this._zeldaIntroVideo.currentTime = 0;
  }

  _init() {
    this._initGameBoyParts();
    this._initButtons();
    this._initCrossGroup();
    this._addMaterials();
    this._initCrossMeshes();
    this._initInitialRotation();
    this._initKeyboardEvents();
    this._initSounds();
    this._initGameBoyAudio();
  }

  _initGameBoyParts() {
    const gameBoyModel = Loader.assets['game-boy'].scene;

    for (const partName in GAME_BOY_PART_TYPE) {
      const partType = GAME_BOY_PART_TYPE[partName];
      const part = gameBoyModel.children.find(child => child.name === partType);

      part.userData['partType'] = partType;
      part.userData['sceneObjectType'] = this._sceneObjectType;
      part.userData['isActive'] = GAME_BOY_ACTIVE_PARTS.includes(partType);
      part.userData['showOutline'] = GAME_BOY_ACTIVE_PARTS.includes(partType);
      part.userData['isDraggable'] = this._draggableParts.includes(partType) || partType === GAME_BOY_PART_TYPE.VolumeControl;
      part.userData['startPosition'] = part.position.clone();

      this._parts[partType] = part;
      this._allMeshes.push(part);
      this.add(part);
    }

    if (SCENE_CONFIG.isMobile) {
      const screen = this._parts[GAME_BOY_PART_TYPE.Screen];
      screen.userData['isActive'] = true;
      screen.userData['showOutline'] = false;
    }

    this._parts[GAME_BOY_PART_TYPE.VolumeControl].rotationZ = 0;
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
    this._addCartridgePocketMaterial();
    this._addPowerIndicatorMaterial();
    this._addScreenMaterial();
    this._initZeldaIntroVideo();
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

  _addCartridgePocketMaterial() {
    const cartridgePocketStandardTexture = this._cartridgePocketStandardTexture = Loader.assets['baked-cartridge-pocket'];
    cartridgePocketStandardTexture.flipY = false;

    const cartridgePocketWidthCartridgeTexture = this._cartridgePocketWithCartridgeTexture = Loader.assets['baked-cartridge-pocket-with-cartridge'];
    cartridgePocketWidthCartridgeTexture.flipY = false;

    const bakedMaterial = new THREE.MeshBasicMaterial({
      map: cartridgePocketStandardTexture,
    });

    const cartridgePocket = this._parts[GAME_BOY_PART_TYPE.CartridgePocket];
    cartridgePocket.material = bakedMaterial;
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
    const canvasTexture = this._canvasTexture = new THREE.Texture(this._pixiCanvas);
    canvasTexture.flipY = false;
    canvasTexture.magFilter = THREE.NearestFilter;

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

  _initZeldaIntroVideo() {
    const videoElement = this._zeldaIntroVideo = document.createElement('video');
    videoElement.muted = true;
    videoElement.controls = true;
    videoElement.playsInline = true;
    videoElement.src = '/video/zelda-intro.mp4';

    videoElement.addEventListener('ended', () => {
      this._onZeldaIntroEnded();
    });

    const videoTexture = this._zeldaVideoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.flipY = false;
    videoTexture.magFilter = THREE.NearestFilter;
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
      const config = GAME_BOY_BUTTONS_CONFIG[buttonType];

      if (config.keyCode && config.keyCode.includes(e.code)) {
        this._pressDownButton(buttonType, false);
      }
    }
  }

  _onPressUpSignal(e) {
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

  _playSound(sound) {
    if (sound.isPlaying) {
      sound.stop();
    }

    sound.play();
  }

  _initSounds() {
    this._initPowerSwitchSound();
    this._initInsertEjectCartridgeSound();
  }

  _initPowerSwitchSound() {
    const powerSwitchSound = this._powerSwitchSound = new THREE.PositionalAudio(this._audioListener);
    this.add(powerSwitchSound);

    powerSwitchSound.setRefDistance(10);

    const powerButton = this._parts[GAME_BOY_PART_TYPE.PowerButton];
    powerSwitchSound.position.copy(powerButton.position);

    powerSwitchSound.setVolume(this._globalVolume);

    Loader.events.on('onAudioLoaded', () => {
      powerSwitchSound.setBuffer(Loader.assets['power-switch']);
    });
  }

  _initInsertEjectCartridgeSound() {
    const insertCartridgeSound = this._insertCartridgeSound = new THREE.PositionalAudio(this._audioListener);
    this.add(insertCartridgeSound);

    const ejectCartridgeSound = this._ejectCartridgeSound = new THREE.PositionalAudio(this._audioListener);
    this.add(ejectCartridgeSound);

    insertCartridgeSound.setRefDistance(10);
    ejectCartridgeSound.setRefDistance(10);

    const body = this._parts[GAME_BOY_PART_TYPE.Body];
    insertCartridgeSound.position.copy(body.position);
    ejectCartridgeSound.position.copy(body.position);

    insertCartridgeSound.setVolume(this._globalVolume);
    ejectCartridgeSound.setVolume(this._globalVolume);

    Loader.events.on('onAudioLoaded', () => {
      insertCartridgeSound.setBuffer(Loader.assets['insert-cartridge']);
      ejectCartridgeSound.setBuffer(Loader.assets['eject-cartridge']);
    });
  }

  _initGameBoyAudio() {
    const audioGroup = new THREE.Group();
    this.add(audioGroup);

    audioGroup.position.x = 0.7;
    audioGroup.position.y = -1.5;
    audioGroup.position.z = 0.3;

    new GameBoyAudio(this._audioListener, audioGroup);
  }
}
