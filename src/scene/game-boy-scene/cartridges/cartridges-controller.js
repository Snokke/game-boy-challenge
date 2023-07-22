import * as THREE from 'three';
import Cartridge from './cartridge';
import { CARTRIDGES_CONFIG, CARTRIDGE_TYPE } from './data/cartridges-config';

export default class CartridgesController extends THREE.Group {
  constructor() {
    super();

    this._cartridges = {};
    this._cartridgesArray = [];

    this._init();
  }

  getAllMeshes() {
    const allMeshes = [];

    this._cartridgesArray.forEach(cartridge => {
      allMeshes.push(cartridge.getMesh());
    });

    return allMeshes;
  }

  onClick(object) {
    const objectPartType = object.userData['partType'];
    console.log(objectPartType);
  }

  _init() {
    const cartridgesTypes = [
      CARTRIDGE_TYPE.Tetris,
      CARTRIDGE_TYPE.Zelda,
    ];

    for (let i = 0; i < cartridgesTypes.length; i++) {
      const type = cartridgesTypes[i];

      const cartridge = new Cartridge(type);
      this.add(cartridge);

      cartridge.position.copy(CARTRIDGES_CONFIG.startPosition).add(CARTRIDGES_CONFIG.offset.clone().multiplyScalar(i));

      this._cartridges[type] = cartridge;
      this._cartridgesArray.push(cartridge);
    }
  }
}
