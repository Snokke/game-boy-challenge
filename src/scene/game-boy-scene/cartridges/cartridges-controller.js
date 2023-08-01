import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Cartridge from './cartridge';
import { CARTRIDGES_CONFIG, CARTRIDGE_TYPE } from './data/cartridges-config';
import { MessageDispatcher } from 'black-engine';
import Delayed from '../../../core/helpers/delayed-call';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config';

export default class CartridgesController extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._cartridges = {};
    this._cartridgesArray = [];

    this._timeByCartridgeType = {};
    this._showCartridgeObjects = {};
    this._showCartridgeTween = {};
    this._isCartridgeShown = {};
    this._positionObject = {};
    this._cartridgeDisableFloating = {};
    this._insertedCartridge = null;

    this._init();
  }

  update(dt) {
    this._cartridgesArray.forEach(cartridge => {
      const cartridgeType = cartridge.getType();

      if (!this._cartridgeDisableFloating[cartridgeType]) {
        const floatingConfig = CARTRIDGES_CONFIG.floating[cartridgeType];
        this._timeByCartridgeType[cartridgeType] += dt;

        cartridge.rotation.z = Math.sin(this._timeByCartridgeType[cartridgeType] * floatingConfig.speed * 0.5) * floatingConfig.rotation.z * THREE.MathUtils.DEG2RAD;

        this._positionObject[cartridgeType].position.y = cartridge.startPosition.y + Math.sin(this._timeByCartridgeType[cartridgeType] * floatingConfig.speed) * floatingConfig.amplitude;
        cartridge.position.lerp(this._positionObject[cartridgeType].position, 0.1);
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

    const insertedCartridge = this._checkIsCartridgeInserted(cartridge);

    if (insertedCartridge !== null) {
      this.events.post('onCartridgeEjecting');
      this._moveCartridgeFromGameBoy(insertedCartridge, 7, 200);

      this.events.post('onCartridgeInserting');
      this._moveCartridgeToGameBoy(cartridge, 3.2);
    } else {

      if (!cartridge.isInserted()) {
        this.events.post('onCartridgeInserting');
        this._moveCartridgeToGameBoy(cartridge, 5);
      } else {
        this.events.post('onCartridgeEjecting');
        this._moveCartridgeFromGameBoy(cartridge, 5, 400);
      }
    }
  }

  onZoomChanged(zoomPercent) {
    this._cartridgesArray.forEach(cartridge => {
      const cartridgeType = cartridge.getType();
      this._positionObject[cartridgeType].position.x = cartridge.startPosition.x - 1.8 * zoomPercent;
    });
  }

  ejectCartridge() {
    if (this._insertedCartridge) {
      const mesh = this._insertedCartridge.getMesh();
      this.onPointerDown(mesh);
    }
  }

  insertCartridge(cartridgeType) {
    if (this._insertedCartridge) {
      const insertedCartridgeType = this._insertedCartridge.getType();

      if (insertedCartridgeType !== cartridgeType) {
        const mesh = this._cartridges[cartridgeType].getMesh();
        this.onPointerDown(mesh);
      }
    } else {
      const mesh = this._cartridges[cartridgeType].getMesh();
      this.onPointerDown(mesh);
    }
  }

  _checkIsCartridgeInserted(clickedCartridge) {
    let isCartridgeInserted = null;

    this._cartridgesArray.forEach(cartridge => {
      if (cartridge.isInserted() && cartridge.getType() !== clickedCartridge.getType()) {
        isCartridgeInserted = cartridge;
      }
    });

    return isCartridgeInserted;
  }

  _moveCartridgeToGameBoy(cartridge, speed) {
    const cartridgeType = cartridge.getType();
    cartridge.setInserted();

    this._insertedCartridge = cartridge;

    this._cartridgeDisableFloating[cartridgeType] = true;
    cartridge.lastRotation = cartridge.rotation.clone();

    const positions = CARTRIDGES_CONFIG.positions.insert;
    const distance = cartridge.position.distanceTo(positions.beforeInsert);
    const time = distance / (speed * 0.001);

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

        Delayed.call(200, () => this.events.post('cartridgeInsertSound'));
      });

    new TWEEN.Tween(cartridge.rotation)
      .to({ x: 0, y: Math.PI, z: 0 }, time)
      .easing(TWEEN.Easing.Quartic.Out)
      .start();
  }

  _moveCartridgeFromGameBoy(cartridge, speed, ejectTime) {
    const cartridgeType = cartridge.getType();
    cartridge.setNotInserted();

    GAME_BOY_CONFIG.currentCartridge = 'NONE';
    this._insertedCartridge = null;
    this.events.post('cartridgeTypeChanged');
    this.events.post('cartridgeEjectSound');
    this.events.post('cartridgeStartEjecting');

    const positions = CARTRIDGES_CONFIG.positions.eject;
    const floatingConfig = CARTRIDGES_CONFIG.floating[cartridgeType];

    cartridge.setStandardTexture();

    const moveTween = new TWEEN.Tween(cartridge.position)
      .to({ x: positions.beforeEject.x, y: positions.beforeEject.y, z: positions.beforeEject.z }, ejectTime)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(400)
      .start()
      .onComplete(() => {
        const distance = cartridge.position.distanceTo(floatingConfig.startPosition);
        const time = distance / (speed * 0.001);

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
            cartridge.position.copy(floatingConfig.startPosition);
            this._onCartridgeEjected(cartridgeType);
          });

        new TWEEN.Tween(cartridge.rotation)
          .to({
            x: cartridge.lastRotation.x,
            y: cartridge.lastRotation.y,
            z: cartridge.lastRotation.z,
          }, time)
          .easing(TWEEN.Easing.Quartic.Out)
          .start();
      })

    moveTween.onStart(() => {
      this.add(cartridge);
    });
  }

  _onCartridgeInserted(cartridge) {
    const cartridgeType = cartridge.getType();
    GAME_BOY_CONFIG.currentCartridge = cartridgeType;
    this.events.post('cartridgeTypeChanged');

    this._enableCartridges();
    this.events.post('onCartridgeInserted', cartridge);

    cartridge.setInPocketTexture();
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
      this._timeByCartridgeType[cartridgeType] = 0;
      this._positionObject[cartridgeType] = new THREE.Object3D();
      this._positionObject[cartridgeType].position.copy(cartridge.position);
    });
  }
}
