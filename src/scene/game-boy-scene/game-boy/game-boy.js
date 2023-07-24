import * as THREE from 'three';
import { GAME_BOY_PART_TYPE, GAME_BOY_ACTIVE_PARTS, GAME_BOY_CROSS_PARTS } from './data/game-boy-data';
import Loader from '../../../core/loader';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';

export default class GameBoy extends THREE.Group {
  constructor(pixiCanvas) {
    super();

    this._pixiCanvas = pixiCanvas;

    this._parts = [];
    this._allMeshes = [];
    this._crossMeshes = [];

    this._sceneObjectType = SCENE_OBJECT_TYPE.GameBoy;

    this._init();
  }

  update(dt) {
    // todo if game is active
    this._parts[GAME_BOY_PART_TYPE.Screen].material.map.needsUpdate = true;
  }

  onClick(object) {
    const objectPartType = object.userData['partType'];

    console.log(objectPartType);
  }

  getAllMeshes() {
    return this._allMeshes;
  }

  getOutlineMeshes(object) {
    const partType = object.userData['partType'];

    if (GAME_BOY_CROSS_PARTS.includes(partType)) {
      return this._crossMeshes;
    }

    return [object];
  }

  _init() {
    this._initGameBoyParts();
    this._addMaterials();
    this._initCrossMeshes();
  }

  _initGameBoyParts() {
    const gameBoyModel = Loader.assets['game-boy'].scene;

    for (const partName in GAME_BOY_PART_TYPE) {
      const partType = GAME_BOY_PART_TYPE[partName];
      const part = gameBoyModel.children.find(child => child.name === partType);

      part.userData['partType'] = partType;
      part.userData['sceneObjectType'] = this._sceneObjectType;
      part.userData['isActive'] = GAME_BOY_ACTIVE_PARTS.includes(partType);

      this._parts[partType] = part;
      this._allMeshes.push(part);
      this.add(part);
    }
  }

  _addMaterials() {
    this._addBakedMaterial();
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
}
