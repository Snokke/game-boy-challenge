import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Cartridge from './cartridge';
import { CARTRIDGES_BY_TYPE_CONFIG, CARTRIDGES_CONFIG, CARTRIDGE_TYPE } from './data/cartridges-config';
import { MessageDispatcher } from 'black-engine';

export default class CartridgesController extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._cartridges = {};
    this._cartridgesArray = [];
    this._time = 0;

    this._showCartridgeObjects = {};
    this._showCartridgeTween = {};
    this._isCartridgeShown = {};

    this._cartridgeDisableFloating = {};

    this._init();
  }

  update(dt) {
    this._time += dt;

    this._cartridgesArray.forEach(cartridge => {
      const cartridgeType = cartridge.getType();

      if (!this._cartridgeDisableFloating[cartridgeType]) {
        const floatingConfig = CARTRIDGES_CONFIG.floating[cartridgeType];

        // const showPositionY = this._showCartridgeObjects[cartridgeType].position.y;
        cartridge.position.y = cartridge.startPosition.y + Math.sin(floatingConfig.startTime + this._time * floatingConfig.speed) * floatingConfig.amplitude;
        cartridge.rotation.z = Math.sin(floatingConfig.startTime + this._time * floatingConfig.speed * 0.5) * floatingConfig.rotation.z * THREE.MathUtils.DEG2RAD;
      }
    });
  }

  getAllMeshes() {
    const allMeshes = [];

    this._cartridgesArray.forEach(cartridge => {
      allMeshes.push(cartridge.getMesh());
    });

    return allMeshes;
  }

  onPointerDown(mesh) {
    this._disableCartridges();

    const cartridgeType = mesh.userData['partType'];
    const cartridge = this._cartridges[cartridgeType];

    if (!cartridge.isInserted()) {
      this.events.post('onCartridgeInserting');
      this._moveCartridgeToGameBoy(cartridge);
    } else {
      this.events.post('onCartridgeEjecting');
      this._moveCartridgeFromGameBoy(cartridge);
    }
  }

  _moveCartridgeToGameBoy(cartridge) {
    const cartridgeType = cartridge.getType();
    cartridge.setInserted();

    this._cartridgeDisableFloating[cartridgeType] = true;

    const positions = CARTRIDGES_CONFIG.positions.insert;
    const distance = cartridge.position.distanceTo(positions.beforeInsert);
    const time = distance / (CARTRIDGES_CONFIG.movingSpeed * 0.001);

    new TWEEN.Tween(cartridge.position)
      .to({
        x: [positions.middle.x, positions.beforeInsert.x],
        y: [positions.middle.y, positions.beforeInsert.y],
        z: [positions.middle.z, positions.beforeInsert.z],
        }, time)
      .interpolation(TWEEN.Interpolation.Bezier)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        new TWEEN.Tween(cartridge.position)
          .to({ x: positions.slot.x, y: positions.slot.y, z: positions.slot.z }, 400)
          .easing(TWEEN.Easing.Back.In)
          .delay(100)
          .start()
          .onComplete(() => {
            this._onCartridgeInserted(cartridge);
          });
      });

    new TWEEN.Tween(cartridge.rotation)
      .to({ x: 0, y: Math.PI, z: 0 }, time)
      .easing(TWEEN.Easing.Quartic.Out)
      .start();
  }

  _moveCartridgeFromGameBoy(cartridge) {
    const cartridgeType = cartridge.getType();
    cartridge.setNotInserted();

    const positions = CARTRIDGES_CONFIG.positions.eject;
    const floatingConfig = CARTRIDGES_CONFIG.floating[cartridgeType];

    const moveTween = new TWEEN.Tween(cartridge.position)
      .to({ x: positions.beforeEject.x, y: positions.beforeEject.y, z: positions.beforeEject.z }, 400)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(400)
      .start()
      .onComplete(() => {
        const distance = cartridge.position.distanceTo(floatingConfig.startPosition);
        const time = distance / (CARTRIDGES_CONFIG.movingSpeed * 0.001);

        new TWEEN.Tween(cartridge.position)
          .to({
            x: [positions.middle.x, floatingConfig.startPosition.x],
            y: [positions.middle.y, floatingConfig.startPosition.y],
            z: [positions.middle.z, floatingConfig.startPosition.z],
            }, time)
          .interpolation(TWEEN.Interpolation.Bezier)
          .easing(TWEEN.Easing.Sinusoidal.Out)
          .start()
          .onComplete(() => {
            this._onCartridgeEjected(cartridgeType);
          });

        new TWEEN.Tween(cartridge.rotation)
          .to({
            x: floatingConfig.rotation.x * THREE.MathUtils.DEG2RAD,
            y: floatingConfig.rotation.y * THREE.MathUtils.DEG2RAD,
            z: floatingConfig.rotation.z * THREE.MathUtils.DEG2RAD
          }, time)
          .easing(TWEEN.Easing.Quartic.Out)
          .start();
      })

    moveTween.onStart(() => {
      this.add(cartridge);
    });
  }

  _onCartridgeInserted(cartridge) {
    this._enableCartridges();
    this.events.post('onCartridgeInserted', cartridge);
  }

  _onCartridgeEjected(cartridgeType) {
    this._cartridgeDisableFloating[cartridgeType] = false;
    this._enableCartridges();
    this.events.post('onCartridgeEjected');
  }

  _disableCartridges() {
    this._cartridgesArray.forEach(cartridge => {
      cartridge.disableActivity();
    });
  }

  _enableCartridges() {
    this._cartridgesArray.forEach(cartridge => {
      cartridge.enableActivity();
    });
  }

  onPointerOver(object) {
    // const objectPartType = object.userData['partType'];
    // this._moveOtherCartridgesToStartPosition(objectPartType);

    // if (this._isCartridgeShown[objectPartType] || objectPartType === CARTRIDGE_TYPE.Tetris) {
    //   return;
    // }

    // this._isCartridgeShown[objectPartType] = true;
    // this.stopTween(objectPartType);

    // this._showCartridgeObjects[objectPartType].position.copy(object.position);

    // this._showCartridgeTween[objectPartType] = new TWEEN.Tween(this._showCartridgeObjects[objectPartType].position)
    //   .to({ y: object.position.y + 1 }, 500)
    //   .easing(TWEEN.Easing.Sinusoidal.Out)
    //   .start();
  }

  onPointerOut() {
    // for (const cartridgeType in this._isCartridgeShown) {
    //   this._moveCartridgeToInitPosition(cartridgeType);
    // }
  }

  _moveOtherCartridgesToStartPosition(cartridgeType) {
    for (const type in this._isCartridgeShown) {
      if (type !== cartridgeType) {
        this._moveCartridgeToInitPosition(type);
      }
    }
  }

  _moveCartridgeToInitPosition(cartridgeType) {
    if (this._isCartridgeShown[cartridgeType]) {
      this._isCartridgeShown[cartridgeType] = false;
      this.stopTween(cartridgeType);

      this._showCartridgeTween[cartridgeType] = new TWEEN.Tween(this._showCartridgeObjects[cartridgeType].position)
        .to({ y: 0 }, 500)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start();
    }
  }

  getOutlineMeshes(object) {
    return [object];
  }

  stopTween(cartridgeType) {
    if (this._showCartridgeTween[cartridgeType]) {
      this._showCartridgeTween[cartridgeType].stop();
    }
  }

  _init() {
    this._initCartridges();
    this._initShowCartridgeObjects();
  }

  _initCartridges() {
    const cartridgesTypes = [
      CARTRIDGE_TYPE.Tetris,
      CARTRIDGE_TYPE.Zelda,
      CARTRIDGE_TYPE.DuckTales,
    ];

    for (let i = 0; i < cartridgesTypes.length; i++) {
      const type = cartridgesTypes[i];
      const config = CARTRIDGES_CONFIG.floating[type];

      const cartridge = new Cartridge(type);
      this.add(cartridge);

      cartridge.position.copy(config.startPosition);
      cartridge.startPosition = cartridge.position.clone();

      cartridge.rotation.y = config.rotation.y * THREE.MathUtils.DEG2RAD;
      cartridge.rotation.x = config.rotation.x * THREE.MathUtils.DEG2RAD;

      this._cartridges[type] = cartridge;
      this._cartridgesArray.push(cartridge);
    }
  }

  _initShowCartridgeObjects() {
    this._cartridgesArray.forEach(cartridge => {
      const cartridgeType = cartridge.getType();
      this._showCartridgeObjects[cartridgeType] = new THREE.Object3D();
      this._isCartridgeShown[cartridgeType] = false;
      this._cartridgeDisableFloating[cartridgeType] = false;
    });
  }
}
