import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { GAME_BOY_PART_TYPE, GAME_BOY_ACTIVE_PARTS, GAME_BOY_CROSS_PARTS, BUTTON_TYPE, GAME_BOY_DRAGGABLE_PARTS } from './data/game-boy-data';
import Loader from '../../../core/loader';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';
import { GAME_BOY_BUTTONS_CONFIG, GAME_BOY_CONFIG, GAME_BOY_BUTTON_PART_BY_TYPE, CROSS_BUTTONS } from './data/game-boy-config';
import { Application, EventEmitter } from 'pixi.js';
import mixTextureColorVertexShader from './mix-texture-color-shaders/mix-texture-color-vertex.glsl';
import mixTextureColorFragmentShader from './mix-texture-color-shaders/mix-texture-color-fragment.glsl';
import mixTextureBitmapVertexShader from './mix-texture-bitmap-shaders/mix-texture-bitmap-vertex.glsl';
import mixTextureBitmapFragmentShader from './mix-texture-bitmap-shaders/mix-texture-bitmap-fragment.glsl';
import { SOUNDS_CONFIG } from '../../../Data/Configs/Main/sounds-config';
import GameBoyAudio from './game-boy-audio/game-boy-audio';
import SCENE_CONFIG from '../../../Data/Configs/Main/scene-config';
import { Timeout } from '../../../core/helpers/timeout';
import DEBUG_CONFIG from '../../../Data/Configs/Main/debug-config';
import { GLTF } from 'three/examples/jsm/Addons.js';

export default class GameBoy extends THREE.Group {
  public events: EventEmitter;

  private pixiCanvas: HTMLCanvasElement;
  private gameBoyPixiApp: Application;
  private audioListener: THREE.AudioListener;
  private pixiApp: Application;
  private sceneObjectType: SCENE_OBJECT_TYPE;

  private parts: GAME_BOY_PART_TYPE[];
  private allMeshes: THREE.Object3D[];
  private crossMeshes: THREE.Mesh[];
  private buttons: any;
  private buttonTween: any;
  private powerButtonTween: any;
  private powerIndicatorTween: any;
  private crossButtonsGroup: THREE.Group;

  private rotationObject: THREE.Object3D;
  private rotationQuaternion: THREE.Quaternion;
  private pointerPosition: THREE.Vector2;
  private isDefaultRotation: boolean;
  private returnRotationTimer: any;

  private isDragging: boolean;
  private draggingObjectType: any;
  private pressedButtonType: any;
  private isIntroActive: boolean;
  private rotationLerpSpeed: number;
  private buttonRepeatTime: number;
  private firstRepeatTimer: any;
  private buttonRepeatAllowed: boolean;

  private globalVolume: number;
  private isSoundsEnabled: boolean;
  private powerSwitchSound: THREE.PositionalAudio;
  private insertCartridgeSound: THREE.PositionalAudio;
  private ejectCartridgeSound: THREE.PositionalAudio;

  private zeldaIntroVideo: HTMLVideoElement;
  private isZeldaIntroPlaying: boolean;

  private isMobileZoomIn: boolean;
  private draggableParts: any;
  private dragRotationSpeed: number;

  private updateSkipAllowed: boolean;
  private updateScreenSkipFrames: number;
  private updateScreenCounter: number;
  private isFirstTextureUpdate: boolean;

  private cartridgePocketStandardTexture: THREE.Texture;
  private cartridgePocketWithCartridgeTexture: THREE.Texture;
  private cartridge: any;
  private zeldaVideoTexture: THREE.VideoTexture;

  constructor(pixiCanvas: HTMLCanvasElement, gameBoyPixiApp: Application, audioListener: THREE.AudioListener, pixiApp: Application) {
    super();

    this.events = new EventEmitter();

    this.pixiCanvas = pixiCanvas;
    this.gameBoyPixiApp = gameBoyPixiApp;
    this.audioListener = audioListener;
    this.pixiApp = pixiApp;
    this.sceneObjectType = SCENE_OBJECT_TYPE.GameBoy;

    this.parts = [];
    this.allMeshes = [];
    this.crossMeshes = [];
    this.buttons = {};
    this.buttonTween = {};
    this.powerButtonTween = null;
    this.powerIndicatorTween = null;
    this.crossButtonsGroup = null;

    this.rotationObject = new THREE.Object3D();
    this.rotationQuaternion = new THREE.Quaternion();
    this.pointerPosition = new THREE.Vector2();
    this.isDefaultRotation = true;
    this.returnRotationTimer = null;

    this.isDragging = false;
    this.draggingObjectType = null;
    this.pressedButtonType = null;
    this.isIntroActive = GAME_BOY_CONFIG.intro.enabled && !DEBUG_CONFIG.startState.disableIntro;
    this.rotationLerpSpeed = GAME_BOY_CONFIG.rotation.standardLerpSpeed;
    this.buttonRepeatTime = 0;
    this.firstRepeatTimer = null;
    this.buttonRepeatAllowed = false;

    this.globalVolume = SOUNDS_CONFIG.masterVolume;
    this.isSoundsEnabled = true;
    this.powerSwitchSound = null;
    this.insertCartridgeSound = null;
    this.ejectCartridgeSound = null;

    this.zeldaIntroVideo = null;
    this.isZeldaIntroPlaying = false;

    this.isMobileZoomIn = false;
    this.draggableParts = SCENE_CONFIG.isMobile ? GAME_BOY_DRAGGABLE_PARTS : [...GAME_BOY_DRAGGABLE_PARTS, GAME_BOY_PART_TYPE.Screen];
    this.dragRotationSpeed = SCENE_CONFIG.isMobile ? GAME_BOY_CONFIG.rotation.mobileDragRotationSpeed : GAME_BOY_CONFIG.rotation.dragRotationSpeed;

    this.updateSkipAllowed = SCENE_CONFIG.isMobile;
    this.updateScreenSkipFrames = 2;
    this.updateScreenCounter = this.updateScreenSkipFrames;
    this.isFirstTextureUpdate = false

    this.init();
  }

  public update(dt: number): void {
    this.updateRotation(dt);
    this.updateScreenTexture();
    this.updateButtonsRepeat(dt);
  }

  public onPointerDown(object: THREE.Object3D): void {
    const objectPartType: GAME_BOY_PART_TYPE = object.userData['partType'];

    for (const buttonPart in GAME_BOY_BUTTON_PART_BY_TYPE) {
      const buttonType: BUTTON_TYPE = GAME_BOY_BUTTON_PART_BY_TYPE[buttonPart];

      if (objectPartType === buttonPart) {
        this.pressDownButton(buttonType);
      }
    }

    if (SCENE_CONFIG.isMobile && objectPartType === GAME_BOY_PART_TYPE.Screen) {
      const credits = document.querySelector('.credits') as HTMLElement;

      if (this.isMobileZoomIn) {
        this.isMobileZoomIn = false;
        this.events.emit('onZoomOut');

        credits.classList.remove('hide');
        credits.classList.add('show');
      } else {
        this.isMobileZoomIn = true;
        this.events.emit('onZoomIn');

        credits.classList.remove('show');
        credits.classList.add('hide');
      }
    }

    if (objectPartType === GAME_BOY_PART_TYPE.PowerButton || objectPartType === GAME_BOY_PART_TYPE.PowerButtonFrame) {
      this.powerButtonSwitch();
      this.resetReturnRotationTimer();
    }
  }

  public onPointerUp(): void {
    if (!this.pressedButtonType) {
      return;
    }

    this.pressUpButton(this.pressedButtonType);
  }

  public onPointerMove(x: number, y: number): void {
    this.pointerPosition.set(x, y);

    if (this.isDragging || !this.isDefaultRotation || !GAME_BOY_CONFIG.rotation.rotationCursorEnabled || !GAME_BOY_CONFIG.rotation.debugRotationCursorEnabled || SCENE_CONFIG.isMobile) {
      return;
    }

    const percentX = x / window.innerWidth * 2 - 1;
    const percentY = y / window.innerHeight * 2 - 1;

    this.rotationObject.quaternion.copy(this.rotationQuaternion);
    this.rotationObject.rotateOnAxis(new THREE.Vector3(0, 1, 0), (percentX) * GAME_BOY_CONFIG.rotation.cursorRotationSpeed);
    this.rotationObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), (percentY) * GAME_BOY_CONFIG.rotation.cursorRotationSpeed);
  }

  public onPointerDragMove(dragX: number, dragY: number): void {
    if (this.draggingObjectType === GAME_BOY_PART_TYPE.VolumeControl) {
      const volumeControl = this.parts[GAME_BOY_PART_TYPE.VolumeControl];
      const maxAngle = GAME_BOY_CONFIG.volumeController.maxAngle * THREE.MathUtils.DEG2RAD;
      volumeControl.rotation.z = volumeControl.rotationZ + dragY * GAME_BOY_CONFIG.volumeController.sensitivity;

      if (volumeControl.rotation.z < -maxAngle) {
        volumeControl.rotation.z = -maxAngle;
      }

      if (volumeControl.rotation.z > maxAngle) {
        volumeControl.rotation.z = maxAngle;
      }

      SOUNDS_CONFIG.gameBoyVolume = (volumeControl.rotation.z + maxAngle) / (maxAngle * 2);
      this.events.emit('onGameBoyVolumeChanged');
    }

    if (this.draggableParts.includes(this.draggingObjectType) && GAME_BOY_CONFIG.rotation.rotationDragEnabled && GAME_BOY_CONFIG.rotation.debugRotationDragEnabled) {
      this.rotationObject.quaternion.copy(this.rotationQuaternion);
      this.rotationObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -dragX * this.dragRotationSpeed * 0.001);
      this.rotationObject.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -dragY * this.dragRotationSpeed * 0.001);
    }
  }

  public onPointerDragDown(object: THREE.Object3D): void {
    const objectPartType: GAME_BOY_PART_TYPE = object.userData['partType'];

    if (objectPartType === GAME_BOY_PART_TYPE.VolumeControl) {
      this.isDragging = true;
      this.draggingObjectType = objectPartType;
      this.stopReturnRotationTimer();
    }

    if (this.draggableParts.includes(objectPartType) && GAME_BOY_CONFIG.rotation.rotationDragEnabled && GAME_BOY_CONFIG.rotation.debugRotationDragEnabled) {
      this.rotationQuaternion.copy(this.quaternion);

      this.isDragging = true;
      this.draggingObjectType = objectPartType;
      this.isDefaultRotation = false;

      this.stopReturnRotationTimer();
    }
  }

  public onDragPointerUp(): void {
    if (!GAME_BOY_CONFIG.rotation.rotationDragEnabled || !GAME_BOY_CONFIG.rotation.debugRotationDragEnabled) {
      return;
    }

    this.isDragging = false;
    this.draggingObjectType = null;

    const volumeControl = this.parts[GAME_BOY_PART_TYPE.VolumeControl];
    volumeControl.rotationZ = volumeControl.rotation.z;

    this.resetReturnRotationTimer();
  }

  public updateVolumeControlRotation(): void {
    if (this.draggingObjectType === GAME_BOY_PART_TYPE.VolumeControl) {
      return;
    }

    const maxAngle = GAME_BOY_CONFIG.volumeController.maxAngle * THREE.MathUtils.DEG2RAD;
    const volumeControl = this.parts[GAME_BOY_PART_TYPE.VolumeControl];

    volumeControl.rotation.z = SOUNDS_CONFIG.gameBoyVolume * (maxAngle * 2) - maxAngle;
    volumeControl.rotationZ = volumeControl.rotation.z;
  }

  public onBackgroundClick(): void {
    this.onReturnRotation();
  }

  public onPointerOver(object: THREE.Object3D): void {
    const objectPartType: GAME_BOY_PART_TYPE = object.userData['partType'];

    if ((this.draggableParts.includes(objectPartType) && GAME_BOY_CONFIG.rotation.rotationDragEnabled && GAME_BOY_CONFIG.rotation.debugRotationDragEnabled)
      || (objectPartType === GAME_BOY_PART_TYPE.VolumeControl)) {
      this.pixiApp.canvas.style.cursor = 'grab';
    }
  }

  public powerButtonSwitch(): void {
    if (GAME_BOY_CONFIG.powerOn) {
      this.powerButtonOff();
    } else {
      this.powerButtonOn();
    }
  }

  public powerOn(): void {
    this.powerButtonOn();
  }

  public powerOff(): void {
    this.powerButtonOff();
  }

  public disableIntro(): void {
    this.isIntroActive = false;
  }

  public resetRotation(): void {
    this.rotationObject.quaternion.copy(new THREE.Quaternion());
    this.rotationQuaternion.copy(new THREE.Quaternion());
    this.isDefaultRotation = true;
    this.rotationLerpSpeed = GAME_BOY_CONFIG.rotation.slowLerpSpeed;
  }

  public resetRotationFast(): void {
    this.rotationObject.quaternion.copy(new THREE.Quaternion());
    this.rotationQuaternion.copy(new THREE.Quaternion());
    this.isDefaultRotation = true;
    this.rotationLerpSpeed = GAME_BOY_CONFIG.rotation.fastLerpSpeed;
  }

  public disableRotation(): void {
    GAME_BOY_CONFIG.rotation.rotationCursorEnabled = false;
    GAME_BOY_CONFIG.rotation.rotationDragEnabled = false;
  }

  public enableRotation(): void {
    GAME_BOY_CONFIG.rotation.rotationCursorEnabled = true;
    GAME_BOY_CONFIG.rotation.rotationDragEnabled = true;
  }

  public addCartridge(cartridge: THREE.Object3D): void {
    this.cartridge = cartridge;
    this.add(this.cartridge);
  }

  public onDebugRotationChanged(): void {
    if (GAME_BOY_CONFIG.rotation.debugRotationCursorEnabled === false) {
      this.onReturnRotation();
    }
  }

  public getAllMeshes(): THREE.Object3D[] {
    return this.allMeshes;
  }

  public getOutlineMeshes(object: THREE.Object3D): THREE.Object3D[] {
    const partType = object.userData['partType'];

    if (GAME_BOY_CROSS_PARTS.includes(partType)) {
      return this.crossMeshes;
    }

    if (partType === GAME_BOY_PART_TYPE.PowerButton || partType === GAME_BOY_PART_TYPE.PowerButtonFrame) {
      const powerButton = this.parts[GAME_BOY_PART_TYPE.PowerButton];
      return [powerButton];
    }

    return [object];
  }

  public onVolumeChanged(volume: number): void {
    this.globalVolume = volume;

    if (this.isSoundsEnabled) {
      this.powerSwitchSound.setVolume(this.globalVolume);
      this.insertCartridgeSound.setVolume(this.globalVolume);
      this.ejectCartridgeSound.setVolume(this.globalVolume);
    }

    GameBoyAudio.changeGlobalVolume(volume);
  }

  public enableSound(): void {
    this.isSoundsEnabled = true;

    this.powerSwitchSound.setVolume(this.globalVolume);
    this.insertCartridgeSound.setVolume(this.globalVolume);
    this.ejectCartridgeSound.setVolume(this.globalVolume);

    GameBoyAudio.enableSound();
  }

  public disableSound(): void {
    this.isSoundsEnabled = false;

    this.powerSwitchSound.setVolume(0);
    this.insertCartridgeSound.setVolume(0);
    this.ejectCartridgeSound.setVolume(0);

    GameBoyAudio.disableSound();
  }

  public playCartridgeInsertSound(): void {
    this.playSound(this.insertCartridgeSound);
  }

  public playCartridgeEjectSound(): void {
    this.playSound(this.ejectCartridgeSound);
  }

  public setCartridgePocketStandardTexture(): void {
    const cartridgePocket = this.parts[GAME_BOY_PART_TYPE.CartridgePocket];
    cartridgePocket.material.map = this.cartridgePocketStandardTexture;
  }

  public setCartridgePocketWithCartridgeTexture(): void {
    const cartridgePocket = this.parts[GAME_BOY_PART_TYPE.CartridgePocket];
    cartridgePocket.material.map = this.cartridgePocketWithCartridgeTexture;
  }

  public showZeldaIntro(): void {
    this.isZeldaIntroPlaying = true;
    this.gameBoyPixiApp.renderer.background.alpha = 0;

    this.zeldaIntroVideo.play();
  }

  private updateRotation(dt: number): void {
    if (DEBUG_CONFIG.orbitControls) {
      return;
    }

    if (this.isIntroActive) {
      this.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), dt * 60 * GAME_BOY_CONFIG.intro.speed * 0.001);
    } else {
      this.rotationLerpSpeed = this.lerp(this.rotationLerpSpeed, GAME_BOY_CONFIG.rotation.standardLerpSpeed, dt * 60 * 0.02);
      this.quaternion.slerp(this.rotationObject.quaternion, dt * 60 * this.rotationLerpSpeed);
    }
  }

  private updateScreenTexture(): void {
    if (GAME_BOY_CONFIG.updateTexture) {
      if (this.updateSkipAllowed) {
        if (this.updateScreenCounter >= this.updateScreenSkipFrames) {
          this.parts[GAME_BOY_PART_TYPE.Screen].material.uniforms.uBitmapTexture.value.needsUpdate = true;
          this.updateScreenCounter = 0;
        }

        this.updateScreenCounter += 1;
      } else {
        this.parts[GAME_BOY_PART_TYPE.Screen].material.uniforms.uBitmapTexture.value.needsUpdate = true;
      }

      if (!this.isFirstTextureUpdate) {
        this.isFirstTextureUpdate = true;
        GAME_BOY_CONFIG.updateTexture = false;
      }
    }
  }

  private updateButtonsRepeat(dt: number): void {
    if (this.pressedButtonType && this.buttonRepeatAllowed) {
      this.buttonRepeatTime += dt;

      if (this.buttonRepeatTime >= GAME_BOY_CONFIG.buttons.repeatTime) {
        this.events.emit('onButtonPress', this.pressedButtonType);
        this.buttonRepeatTime = 0;
      }
    }
  }

  private onReturnRotation(): void {
    this.rotationObject.quaternion.copy(new THREE.Quaternion());
    this.rotationQuaternion.copy(new THREE.Quaternion());
    this.isDefaultRotation = true;
    this.rotationLerpSpeed = GAME_BOY_CONFIG.rotation.slowLerpSpeed;

    this.onPointerMove(this.pointerPosition.x, this.pointerPosition.y);
  }

  private stopReturnRotationTimer(): void {
    if (this.returnRotationTimer) {
      this.returnRotationTimer.stop();
      this.returnRotationTimer = null;
    }
  }

  private setReturnRotationTimer(): void {
    this.returnRotationTimer = Timeout.call(GAME_BOY_CONFIG.rotation.returnTime, () => this.onReturnRotation());
  }

  private resetReturnRotationTimer(): void {
    this.stopReturnRotationTimer();
    this.setReturnRotationTimer();
  }

  private pressDownCrossButton(buttonType: BUTTON_TYPE, autoPressUp = false): void {
    const config = GAME_BOY_BUTTONS_CONFIG[buttonType] as any;
    this.stopButtonTween(buttonType);

    const endAngle = config.rotateAngle * THREE.MathUtils.DEG2RAD;
    const time = Math.abs(this.crossButtonsGroup.rotation[config.rotateAxis] - endAngle) / (config.moveSpeed * 0.001);

    this.buttonTween[buttonType] = new TWEEN.Tween(this.crossButtonsGroup.rotation)
      .to({ [config.rotateAxis]: endAngle }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        if (autoPressUp) {
          this.pressUpCrossButton(buttonType);
        }
      });
  }

  private pressUpCrossButton(buttonType: BUTTON_TYPE): void {
    const config = GAME_BOY_BUTTONS_CONFIG[buttonType] as any;
    this.stopButtonTween(buttonType);

    const time = Math.abs(this.crossButtonsGroup.rotation[config.rotateAxis]) / (config.moveSpeed * 0.001);

    this.buttonTween[buttonType] = new TWEEN.Tween(this.crossButtonsGroup.rotation)
      .to({ [config.rotateAxis]: 0 }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  private pressDownButton(buttonType: BUTTON_TYPE, autoPressUp: boolean = false): void {
    this.pressedButtonType = buttonType;
    this.events.emit('onButtonPress', buttonType);

    if (GAME_BOY_BUTTONS_CONFIG[buttonType].keyRepeat) {
      this.firstRepeatTimer = Timeout.call(GAME_BOY_CONFIG.buttons.firstRepeatTime, () => {
        this.buttonRepeatAllowed = true;
      });
    }

    if (CROSS_BUTTONS.includes(buttonType)) {
      this.pressDownCrossButton(buttonType, autoPressUp);
      return;
    }

    const button = this.buttons[buttonType];
    this.stopButtonTween(buttonType);

    const config = GAME_BOY_BUTTONS_CONFIG[buttonType] as any;

    const distance = Math.abs(button.position.z - (button.userData.startPosition.z - config.moveDistance));
    const time = distance / (config.moveSpeed * 0.001);

    this.buttonTween[buttonType] = new TWEEN.Tween(button.position)
      .to({ z: button.userData.startPosition.z - config.moveDistance }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        if (autoPressUp) {
          this.pressUpButton(buttonType);
        }
      });
  }

  private pressUpButton(buttonType: BUTTON_TYPE): void {
    this.events.emit('onButtonUp', buttonType);
    this.pressedButtonType = null;
    this.buttonRepeatAllowed = false;
    this.stopFirstRepeatTimer();

    if (CROSS_BUTTONS.includes(buttonType)) {
      this.pressUpCrossButton(buttonType);
      return;
    }

    const button = this.buttons[buttonType];
    this.stopButtonTween(buttonType);

    const config = GAME_BOY_BUTTONS_CONFIG[buttonType];

    const distance = Math.abs(button.position.z - button.userData.startPosition.z);
    const time = distance / (config.moveSpeed * 0.001);

    this.buttonTween[buttonType] = new TWEEN.Tween(button.position)
      .to({ z: button.userData.startPosition.z }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  private stopButtonTween(buttonType: BUTTON_TYPE): void {
    if (this.buttonTween[buttonType]) {
      this.buttonTween[buttonType].stop();
    }
  }

  private stopFirstRepeatTimer(): void {
    if (this.firstRepeatTimer) {
      this.firstRepeatTimer.stop();
    }
  }

  private powerButtonOn(): void {
    if (GAME_BOY_CONFIG.powerOn) {
      return;
    }

    GameBoyAudio.onTurnOnGameBoy();

    this.playSound(this.powerSwitchSound);
    GAME_BOY_CONFIG.powerOn = true;
    this.events.emit('onPowerOn');

    const powerIndicator = this.parts[GAME_BOY_PART_TYPE.PowerIndicator];
    const powerButton = this.parts[GAME_BOY_PART_TYPE.PowerButton];

    this.stopPowerButtonTween();

    const distance = Math.abs(powerButton.position.x - (powerButton.userData.startPosition.x + GAME_BOY_CONFIG.powerButton.moveDistance));
    const time = distance / (GAME_BOY_CONFIG.powerButton.moveSpeed * 0.001);

    this.powerButtonTween = new TWEEN.Tween(powerButton.position)
      .to({ x: powerButton.userData.startPosition.x + GAME_BOY_CONFIG.powerButton.moveDistance }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    const powerIndicatorObject = { value: (powerIndicator.material as THREE.ShaderMaterial).uniforms.uMixPercent.value };

    this.powerIndicatorTween = new TWEEN.Tween(powerIndicatorObject)
      .to({ value: 1 }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        (powerIndicator.material as THREE.ShaderMaterial).uniforms.uMixPercent.value = powerIndicatorObject.value;
      });
  }

  private powerButtonOff(): void {
    if (GAME_BOY_CONFIG.powerOn === false) {
      return;
    }

    if (this.isZeldaIntroPlaying) {
      this.onZeldaIntroEnded();
    }

    GameBoyAudio.onTurnOffGameBoy();

    this.playSound(this.powerSwitchSound);
    GAME_BOY_CONFIG.powerOn = false;
    this.events.emit('onPowerOff');

    const powerIndicator = this.parts[GAME_BOY_PART_TYPE.PowerIndicator] as THREE.Mesh;
    const powerButton = this.parts[GAME_BOY_PART_TYPE.PowerButton] as THREE.Mesh;

    this.stopPowerButtonTween();

    const distance = Math.abs(powerButton.position.x - powerButton.userData.startPosition.x);
    const time = distance / (GAME_BOY_CONFIG.powerButton.moveSpeed * 0.001);

    this.powerButtonTween = new TWEEN.Tween(powerButton.position)
      .to({ x: powerButton.userData.startPosition.x }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    const powerIndicatorObject = { value: (powerIndicator.material as THREE.ShaderMaterial).uniforms.uMixPercent.value };

    this.powerIndicatorTween = new TWEEN.Tween(powerIndicatorObject)
      .to({ value: 0 }, time * 28)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(time * 2)
      .start()
      .onUpdate(() => {
        (powerIndicator.material as THREE.ShaderMaterial).uniforms.uMixPercent.value = powerIndicatorObject.value;
      });
  }

  private stopPowerButtonTween(): void {
    if (this.powerButtonTween) {
      this.powerButtonTween.stop();
    }

    if (this.powerIndicatorTween) {
      this.powerIndicatorTween.stop();
    }
  }

  private onZeldaIntroEnded(): void {
    this.isZeldaIntroPlaying = false;
    this.gameBoyPixiApp.renderer.background.alpha = 1;

    this.zeldaIntroVideo.pause();
    this.zeldaIntroVideo.currentTime = 0;
  }

  private init(): void {
    this.initGameBoyParts();
    this.initButtons();
    this.initCrossGroup();
    this.addMaterials();
    this.initCrossMeshes();
    this.initInitialRotation();
    this.initKeyboardEvents();
    this.initSounds();
    this.initGameBoyAudio();

    if (DEBUG_CONFIG.startState.enableGameBoy) {
      setTimeout(() => {
        this.powerOn();
      }, 500);
    }
  }

  private initGameBoyParts(): void {
    const gameBoyModelGLTF: GLTF = Loader.assets['game-boy'] as GLTF;
    const gameBoyModel: THREE.Group = gameBoyModelGLTF.scene;

    for (const partName in GAME_BOY_PART_TYPE) {
      const partType: GAME_BOY_PART_TYPE = GAME_BOY_PART_TYPE[partName];
      const part: THREE.Object3D = gameBoyModel.children.find(child => child.name === partType);

      part.userData['partType'] = partType;
      part.userData['sceneObjectType'] = this.sceneObjectType;
      part.userData['isActive'] = GAME_BOY_ACTIVE_PARTS.includes(partType);
      part.userData['showOutline'] = GAME_BOY_ACTIVE_PARTS.includes(partType);
      part.userData['isDraggable'] = this.draggableParts.includes(partType) || partType === GAME_BOY_PART_TYPE.VolumeControl;
      part.userData['startPosition'] = part.position.clone();

      this.parts[partType] = part;
      this.allMeshes.push(part);
      this.add(part);
    }

    if (SCENE_CONFIG.isMobile) {
      const screen = this.parts[GAME_BOY_PART_TYPE.Screen];
      screen.userData['isActive'] = true;
      screen.userData['showOutline'] = false;
    }

    this.parts[GAME_BOY_PART_TYPE.VolumeControl].rotationZ = 0;
  }

  private initButtons(): void {
    this.buttons[BUTTON_TYPE.A] = this.parts[GAME_BOY_PART_TYPE.ButtonA];
    this.buttons[BUTTON_TYPE.B] = this.parts[GAME_BOY_PART_TYPE.ButtonB];
    this.buttons[BUTTON_TYPE.Select] = this.parts[GAME_BOY_PART_TYPE.ButtonSelect];
    this.buttons[BUTTON_TYPE.Start] = this.parts[GAME_BOY_PART_TYPE.ButtonStart];
    this.buttons[BUTTON_TYPE.CrossLeft] = this.parts[GAME_BOY_PART_TYPE.ButtonCrossLeft];
    this.buttons[BUTTON_TYPE.CrossRight] = this.parts[GAME_BOY_PART_TYPE.ButtonCrossRight];
    this.buttons[BUTTON_TYPE.CrossUp] = this.parts[GAME_BOY_PART_TYPE.ButtonCrossUp];
    this.buttons[BUTTON_TYPE.CrossDown] = this.parts[GAME_BOY_PART_TYPE.ButtonCrossDown];
  }

  private initCrossGroup(): void {
    const crossButtonsGroup: THREE.Group = this.crossButtonsGroup = new THREE.Group();
    this.add(crossButtonsGroup);

    const startPosition: THREE.Vector3 = this.buttons[BUTTON_TYPE.CrossLeft].userData.startPosition;
    crossButtonsGroup.position.copy(startPosition);

    CROSS_BUTTONS.forEach((buttonType: BUTTON_TYPE) => {
      const button: THREE.Object3D = this.buttons[buttonType];
      crossButtonsGroup.add(button);

      button.position.set(0, 0, 0);
    });
  }

  private addMaterials(): void {
    this.addBakedMaterial();
    this.addCartridgePocketMaterial();
    this.addPowerIndicatorMaterial();
    this.initZeldaIntroVideo();
    this.addScreenMaterial();
  }

  private addBakedMaterial(): void {
    const texture: THREE.Texture = Loader.assets['baked-game-boy'] as THREE.Texture;
    texture.flipY = false;

    const bakedMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
      map: texture,
    });

    this.allMeshes.forEach((mesh: THREE.Object3D) => {
      (mesh as THREE.Mesh).material = bakedMaterial;
    });
  }

  private addCartridgePocketMaterial(): void {
    const cartridgePocketStandardTexture: THREE.Texture = this.cartridgePocketStandardTexture = Loader.assets['baked-cartridge-pocket'] as THREE.Texture;
    cartridgePocketStandardTexture.flipY = false;

    const cartridgePocketWithCartridgeTexture: THREE.Texture = this.cartridgePocketWithCartridgeTexture = Loader.assets['baked-cartridge-pocket-with-cartridge'] as THREE.Texture;
    cartridgePocketWithCartridgeTexture.flipY = false;

    const bakedMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
      map: cartridgePocketStandardTexture,
    });

    const cartridgePocket: THREE.Object3D = this.parts[GAME_BOY_PART_TYPE.CartridgePocket];
    (cartridgePocket as THREE.Mesh).material = bakedMaterial;
  }

  private addPowerIndicatorMaterial(): void {
    const texture: THREE.Texture = Loader.assets['baked-power-indicator'] as THREE.Texture;
    texture.flipY = false;

    const bakedMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uColor: { value: new THREE.Color(GAME_BOY_CONFIG.powerButton.powerIndicatorColor) },
        uMixPercent: { value: 0 },
      },
      vertexShader: mixTextureColorVertexShader,
      fragmentShader: mixTextureColorFragmentShader,
    });

    const powerIndicator: THREE.Mesh = this.parts[GAME_BOY_PART_TYPE.PowerIndicator] as THREE.Mesh;
    powerIndicator.material = bakedMaterial;
  }

  private addScreenMaterial(): void {
    const canvasTexture: THREE.Texture = new THREE.Texture(this.pixiCanvas);
    canvasTexture.flipY = false;
    canvasTexture.magFilter = THREE.NearestFilter;

    const bakedTexture: THREE.Texture = Loader.assets['baked-screen-shadow'] as THREE.Texture;
    bakedTexture.flipY = false;

    const material: THREE.ShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uVideoTexture: { value: this.zeldaVideoTexture },
        uBitmapTexture: { value: canvasTexture },
        uTexture: { value: bakedTexture },
      },
      vertexShader: mixTextureBitmapVertexShader,
      fragmentShader: mixTextureBitmapFragmentShader,
    });

    const screen: THREE.Mesh = this.parts[GAME_BOY_PART_TYPE.Screen] as THREE.Mesh;
    screen.material = material;
  }

  private initZeldaIntroVideo(): void {
    const videoElement: HTMLVideoElement = this.zeldaIntroVideo = document.createElement('video');
    videoElement.muted = true;
    videoElement.controls = true;
    videoElement.playsInline = true;
    videoElement.src = '/video/zelda-intro.mp4';

    videoElement.addEventListener('ended', () => {
      this.onZeldaIntroEnded();
    });

    const videoTexture: THREE.VideoTexture = this.zeldaVideoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.flipY = false;
    videoTexture.magFilter = THREE.NearestFilter;
  }

  private initCrossMeshes(): void {
    CROSS_BUTTONS.forEach((buttonType: BUTTON_TYPE) => {
      const button: THREE.Mesh = this.buttons[buttonType];
      this.crossMeshes.push(button);
    });
  }

  private initInitialRotation(): void {
    if (GAME_BOY_CONFIG.intro.enabled) {
      this.rotation.x = GAME_BOY_CONFIG.intro.rotationX * THREE.MathUtils.DEG2RAD;
    }
  }

  private initKeyboardEvents(): void {
    this.onPressDownSignal = this.onPressDownSignal.bind(this);
    this.onPressUpSignal = this.onPressUpSignal.bind(this);

    window.addEventListener("keydown", this.onPressDownSignal);
    window.addEventListener("keyup", this.onPressUpSignal);
  }

  private onPressDownSignal(e: KeyboardEvent): void {
    if (e.repeat) {
      return;
    }

    for (const value in BUTTON_TYPE) {
      const buttonType = BUTTON_TYPE[value as keyof typeof BUTTON_TYPE];
      const config = GAME_BOY_BUTTONS_CONFIG[buttonType] as any;

      if (config.keyCode && config.keyCode.includes(e.code)) {
        this.pressDownButton(buttonType, false);
      }
    }
  }

  private onPressUpSignal(e: KeyboardEvent): void {
    for (const value in BUTTON_TYPE) {
      const buttonType = BUTTON_TYPE[value as keyof typeof BUTTON_TYPE];
      const config = GAME_BOY_BUTTONS_CONFIG[buttonType] as any;
      const keysCode = config.keyCode;

      if (keysCode && keysCode.includes(e.code)) {
        this.pressUpButton(buttonType);
      }
    }
  }

  private lerp(from: number, to: number, t: number): number {
    return from + (to - from) * t;
  }

  private playSound(sound: THREE.PositionalAudio): void {
    if (sound.isPlaying) {
      sound.stop();
    }

    sound.play();
  }

  private initSounds(): void {
    this.initPowerSwitchSound();
    this.initInsertEjectCartridgeSound();
  }

  private initPowerSwitchSound(): void {
    const powerSwitchSound = this.powerSwitchSound = new THREE.PositionalAudio(this.audioListener);
    this.add(powerSwitchSound);

    powerSwitchSound.setRefDistance(10);

    const powerButton = this.parts[GAME_BOY_PART_TYPE.PowerButton];
    powerSwitchSound.position.copy(powerButton.position);

    powerSwitchSound.setVolume(this.globalVolume);

    document.addEventListener('onAudioLoaded', () => {
      powerSwitchSound.setBuffer(Loader.assets['power-switch'] as AudioBuffer);
    });
  }

  private initInsertEjectCartridgeSound(): void {
    const insertCartridgeSound = this.insertCartridgeSound = new THREE.PositionalAudio(this.audioListener);
    this.add(insertCartridgeSound);

    const ejectCartridgeSound = this.ejectCartridgeSound = new THREE.PositionalAudio(this.audioListener);
    this.add(ejectCartridgeSound);

    insertCartridgeSound.setRefDistance(10);
    ejectCartridgeSound.setRefDistance(10);

    const body = this.parts[GAME_BOY_PART_TYPE.Body];
    insertCartridgeSound.position.copy(body.position);
    ejectCartridgeSound.position.copy(body.position);

    insertCartridgeSound.setVolume(this.globalVolume);
    ejectCartridgeSound.setVolume(this.globalVolume);

    document.addEventListener('onAudioLoaded', () => {
      insertCartridgeSound.setBuffer(Loader.assets['insert-cartridge'] as AudioBuffer);
      ejectCartridgeSound.setBuffer(Loader.assets['eject-cartridge'] as AudioBuffer);
    });
  }

  private initGameBoyAudio(): void {
    const audioGroup = new THREE.Group();
    this.add(audioGroup);

    audioGroup.position.x = 0.7;
    audioGroup.position.y = -1.5;
    audioGroup.position.z = 0.3;

    new GameBoyAudio(this.audioListener, audioGroup);
  }
}
