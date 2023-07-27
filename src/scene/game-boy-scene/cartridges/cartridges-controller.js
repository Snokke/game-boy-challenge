import * as THREE from 'three';
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

    this._init();
  }

  update(dt) {
    this._time += dt;

    this._cartridgesArray.forEach(cartridge => {
      const cartridgeType = cartridge.getType();
      const floatingConfig = CARTRIDGES_CONFIG.floating[cartridgeType];

      cartridge.position.y = cartridge.startPosition.y + Math.sin(floatingConfig.startTime + this._time * floatingConfig.speed) * floatingConfig.amplitude;
    });
  }

  getAllMeshes() {
    const allMeshes = [];

    this._cartridgesArray.forEach(cartridge => {
      allMeshes.push(cartridge.getMesh());
    });

    return allMeshes;
  }

  onPointerDown(object) {
    const objectPartType = object.userData['partType'];
    const gameType = CARTRIDGES_BY_TYPE_CONFIG[objectPartType].game;

    this.events.post('onCartridgeInsert', gameType);
  }

  onPointerOver(object) {
    const objectPartType = object.userData['partType'];
    // console.log(objectPartType);
  }

  getOutlineMeshes(object) {
    return [object];
  }

  _init() {
    const cartridgesTypes = [
      CARTRIDGE_TYPE.Tetris,
      CARTRIDGE_TYPE.Zelda,
      CARTRIDGE_TYPE.DuckTales,
    ];

    for (let i = 0; i < cartridgesTypes.length; i++) {
      const type = cartridgesTypes[i];

      const cartridge = new Cartridge(type);
      this.add(cartridge);

      cartridge.position.copy(new THREE.Vector3(-3, -0.5, 0.3)).add(new THREE.Vector3(0, 0.5, -0.3).clone().multiplyScalar(i));
      cartridge.startPosition = cartridge.position.clone();

      const randomRotation = Math.random() * Math.PI * 0.1 - Math.PI * 0.05;
      cartridge.rotation.z = randomRotation;

      this._cartridges[type] = cartridge;
      this._cartridgesArray.push(cartridge);
    }
  }
}
