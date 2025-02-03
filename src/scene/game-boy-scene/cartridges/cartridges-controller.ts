import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import Cartridge from './cartridge';
import { CARTRIDGES_CONFIG, CARTRIDGE_TYPE } from './data/cartridges-config';
import { EventEmitter } from 'pixi.js';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config';
import Timeout from '../../../core/helpers/timeout';

export default class CartridgesController extends THREE.Group {
  public events: EventEmitter;

  private cartridges: { [key in CARTRIDGE_TYPE]?: Cartridge };
  private cartridgesArray: Cartridge[];

  private timeByCartridgeType: { [key in CARTRIDGE_TYPE]?: number };
  private showCartridgeObjects: { [key in CARTRIDGE_TYPE]?: THREE.Object3D };
  private showCartridgeTween: { [key in CARTRIDGE_TYPE]?: any };
  private isCartridgeShown: { [key in CARTRIDGE_TYPE]?: boolean };
  private positionObject: { [key in CARTRIDGE_TYPE]?: THREE.Object3D };
  private cartridgeDisableFloating: { [key in CARTRIDGE_TYPE]?: boolean };
  private insertedCartridge: Cartridge;

  private isInsertingActive: boolean;
  private isEjectingActive: boolean;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.cartridges = {};
    this.cartridgesArray = [];

    this.timeByCartridgeType = {};
    this.showCartridgeObjects = {};
    this.showCartridgeTween = {};
    this.isCartridgeShown = {};
    this.positionObject = {};
    this.cartridgeDisableFloating = {};
    this.insertedCartridge = null;

    this.isInsertingActive = false;
    this.isEjectingActive = false;

    this.init();
  }

  public update(dt: number) {
    this.cartridgesArray.forEach(cartridge => {
      const cartridgeType: CARTRIDGE_TYPE = cartridge.getType();

      if (!this.cartridgeDisableFloating[cartridgeType]) {
        const floatingConfig = CARTRIDGES_CONFIG.floating[cartridgeType];
        this.timeByCartridgeType[cartridgeType] += dt;

        cartridge.rotation.z = Math.sin(this.timeByCartridgeType[cartridgeType] * floatingConfig.speed * 0.5) * floatingConfig.rotation.z * THREE.MathUtils.DEG2RAD;

        this.positionObject[cartridgeType].position.y = cartridge.startPosition.y + Math.sin(this.timeByCartridgeType[cartridgeType] * floatingConfig.speed) * floatingConfig.amplitude;
        cartridge.position.lerp(this.positionObject[cartridgeType].position, 0.1);
      }
    });
  }

  public getAllMeshes(): THREE.Mesh[] {
    const allMeshes: THREE.Mesh[] = [];

    this.cartridgesArray.forEach(cartridge => {
      allMeshes.push(cartridge.getMesh());
    });

    return allMeshes;
  }

  public onPointerDown(mesh: THREE.Mesh) {
    this.disableCartridges();

    const cartridgeType: CARTRIDGE_TYPE = mesh.userData['partType'];
    const cartridge: Cartridge = this.cartridges[cartridgeType];

    const insertedCartridge: Cartridge = this.checkIsCartridgeInserted(cartridge);

    if (insertedCartridge !== null) {
      this.events.emit('onCartridgeEjecting');
      this.moveCartridgeFromGameBoy(insertedCartridge, 7, 200);

      this.events.emit('onCartridgeInserting');
      this.moveCartridgeToGameBoy(cartridge, 3.2);
    } else {

      if (!cartridge.isInserted()) {
        this.events.emit('onCartridgeInserting');
        this.moveCartridgeToGameBoy(cartridge, 5);
      } else {
        this.events.emit('onCartridgeEjecting');
        this.moveCartridgeFromGameBoy(cartridge, 5, 400);
      }
    }
  }

  public onZoomChanged(zoomPercent: number) {
    this.cartridgesArray.forEach(cartridge => {
      const cartridgeType: CARTRIDGE_TYPE = cartridge.getType();
      this.positionObject[cartridgeType].position.x = cartridge.startPosition.x - 1.8 * zoomPercent;
    });
  }

  public ejectCartridge() {
    if (this.insertedCartridge) {
      const mesh: THREE.Mesh = this.insertedCartridge.getMesh();
      this.onPointerDown(mesh);
    }
  }

  public insertCartridge(cartridgeType: CARTRIDGE_TYPE) {
    if (this.insertedCartridge) {
      const insertedCartridgeType: CARTRIDGE_TYPE = this.insertedCartridge.getType();

      if (insertedCartridgeType !== cartridgeType) {
        const mesh: THREE.Mesh = this.cartridges[cartridgeType].getMesh();
        this.onPointerDown(mesh);
      }
    } else {
      const mesh: THREE.Mesh = this.cartridges[cartridgeType].getMesh();
      this.onPointerDown(mesh);
    }
  }

  public onPointerOver(): void { }

  public onPointerOut(): void { }

  public getOutlineMeshes(object: THREE.Object3D): THREE.Object3D[] {
    return [object];
  }

  public stopTween(cartridgeType: CARTRIDGE_TYPE): void {
    if (this.showCartridgeTween[cartridgeType]) {
      this.showCartridgeTween[cartridgeType].stop();
    }
  }

  private checkIsCartridgeInserted(clickedCartridge: Cartridge): Cartridge | null {
    let isCartridgeInserted: Cartridge | null = null;

    this.cartridgesArray.forEach(cartridge => {
      if (cartridge.isInserted() && cartridge.getType() !== clickedCartridge.getType()) {
        isCartridgeInserted = cartridge;
      }
    });

    return isCartridgeInserted;
  }

  private moveCartridgeToGameBoy(cartridge: Cartridge, speed: number): void {
    const cartridgeType: CARTRIDGE_TYPE = cartridge.getType();
    cartridge.setInserted();

    this.insertedCartridge = cartridge;
    this.isInsertingActive = true;

    this.cartridgeDisableFloating[cartridgeType] = true;
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
            this.onCartridgeInserted(cartridge);
          });

        Timeout.call(200, () => this.events.emit('cartridgeInsertSound'));
      });

    new TWEEN.Tween(cartridge.rotation)
      .to({ x: 0, y: Math.PI, z: 0 }, time)
      .easing(TWEEN.Easing.Quartic.Out)
      .start();
  }

  private moveCartridgeFromGameBoy(cartridge: Cartridge, speed: number, ejectTime: number): void {
    const cartridgeType: CARTRIDGE_TYPE = cartridge.getType();
    cartridge.setNotInserted();

    this.isEjectingActive = true;
    GAME_BOY_CONFIG.currentCartridge = 'NONE';
    this.insertedCartridge = null;
    this.events.emit('cartridgeTypeChanged');
    this.events.emit('cartridgeEjectSound');
    this.events.emit('cartridgeStartEjecting');

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
      });

    moveTween.onStart(() => {
      this.add(cartridge);
    });
  }

  private onCartridgeInserted(cartridge: Cartridge): void {
    this.isInsertingActive = false;
    const cartridgeType: CARTRIDGE_TYPE = cartridge.getType();
    GAME_BOY_CONFIG.currentCartridge = cartridgeType;
    this.events.emit('cartridgeTypeChanged');
    this.events.emit('onCartridgeInserted', cartridge);
    cartridge.setInPocketTexture();

    this.enableCartridges();
  }

  private _onCartridgeEjected(cartridgeType: CARTRIDGE_TYPE): void {
    this.isEjectingActive = false;
    this.cartridgeDisableFloating[cartridgeType] = false;
    this.enableCartridges();
    this.events.emit('onCartridgeEjected');
  }

  private disableCartridges(): void {
    this.cartridgesArray.forEach(cartridge => {
      cartridge.disableActivity();
    });
  }

  private enableCartridges(): void {
    if (this.isInsertingActive || this.isEjectingActive) {
      return;
    }

    this.cartridgesArray.forEach((cartridge: Cartridge) => {
      cartridge.enableActivity();
    });
  }

  private init(): void {
    this.initCartridges();
    this.initShowCartridgeObjects();
  }

  private initCartridges(): void {
    const cartridgesTypes: CARTRIDGE_TYPE[] = [
      CARTRIDGE_TYPE.Tetris,
      CARTRIDGE_TYPE.Zelda,
      CARTRIDGE_TYPE.SpaceInvaders,
    ];

    for (let i = 0; i < cartridgesTypes.length; i++) {
      const type: CARTRIDGE_TYPE = cartridgesTypes[i];
      const config = CARTRIDGES_CONFIG.floating[type];

      const cartridge: Cartridge = new Cartridge(type);
      this.add(cartridge);

      cartridge.position.copy(config.startPosition);
      cartridge.startPosition = cartridge.position.clone();

      cartridge.rotation.y = config.rotation.y * THREE.MathUtils.DEG2RAD;
      cartridge.rotation.x = config.rotation.x * THREE.MathUtils.DEG2RAD;

      this.cartridges[type] = cartridge;
      this.cartridgesArray.push(cartridge);
    }
  }

  private initShowCartridgeObjects(): void {
    this.cartridgesArray.forEach((cartridge: Cartridge) => {
      const cartridgeType: CARTRIDGE_TYPE = cartridge.getType();
      this.showCartridgeObjects[cartridgeType] = new THREE.Object3D();
      this.isCartridgeShown[cartridgeType] = false;
      this.cartridgeDisableFloating[cartridgeType] = false;
      this.timeByCartridgeType[cartridgeType] = 0;
      this.positionObject[cartridgeType] = new THREE.Object3D();
      this.positionObject[cartridgeType].position.copy(cartridge.position);
    });
  }
}
