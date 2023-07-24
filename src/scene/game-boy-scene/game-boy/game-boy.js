import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { GAME_BOY_PART_TYPE, GAME_BOY_ACTIVE_PARTS, GAME_BOY_CROSS_PARTS, BUTTON_TYPE } from './data/game-boy-data';
import Loader from '../../../core/loader';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';
import { GAME_BOY_BUTTONS_CONFIG, GAME_BOY_CONFIG, GAME_BOY_PART_BY_TYPE } from './data/game-boy-config';
import { MessageDispatcher } from 'black-engine';
import mixTextureColorVertexShader from './mix-texture-color-shaders/mix-texture-color-vertex.glsl';
import mixTextureColorFragmentShader from './mix-texture-color-shaders/mix-texture-color-fragment.glsl';

export default class GameBoy extends THREE.Group {
  constructor(pixiCanvas) {
    super();

    this.events = new MessageDispatcher();

    this._pixiCanvas = pixiCanvas;

    this._parts = [];
    this._allMeshes = [];
    this._crossMeshes = [];
    this._buttons = {};
    this._buttonTween = {};
    this._powerButtonTween = null;

    this._sceneObjectType = SCENE_OBJECT_TYPE.GameBoy;

    this._init();
  }

  update(dt) {
    // todo if game is active
    this._parts[GAME_BOY_PART_TYPE.Screen].material.map.needsUpdate = true;
  }

  onClick(object) {
    const objectPartType = object.userData['partType'];

    for (const buttonPart in GAME_BOY_PART_BY_TYPE) {
      const buttonType = GAME_BOY_PART_BY_TYPE[buttonPart];

      if (objectPartType === buttonPart) {
        this._pressDownButton(buttonType);
      }
    }

    if (objectPartType === GAME_BOY_PART_TYPE.PowerButton || objectPartType === GAME_BOY_PART_TYPE.PowerButtonFrame) {
      this._powerButtonSwitch();
    }
  }

  powerOn() {
    this._powerButtonOn();
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

  _pressDownButton(buttonType, autoPressUp = true) {
    this.events.post('onButtonPress', buttonType);

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
    this._addMaterials();
    this._initCrossMeshes();
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
    const texture = new THREE.Texture(this._pixiCanvas);
    texture.flipY = false;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    const screen = this._parts[GAME_BOY_PART_TYPE.Screen];
    screen.material = material;
  }

  _initCrossMeshes() {
    this._allMeshes.forEach(mesh => {
      const type = mesh.userData['partType'];

      if (GAME_BOY_CROSS_PARTS.includes(type)) {
        this._crossMeshes.push(mesh);
      }
    });
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
}
