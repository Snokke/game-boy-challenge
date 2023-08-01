import * as THREE from 'three';
import Loader from '../../../core/loader';
import { CARTRIDGES_BY_TYPE_CONFIG } from './data/cartridges-config';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';

export default class Cartridge extends THREE.Group {
  constructor(type) {
    super();

    this._type = type;
    this._config = CARTRIDGES_BY_TYPE_CONFIG[type];
    this._sceneObjectType = SCENE_OBJECT_TYPE.Cartridges;
    this._isInserted = false;

    this._mesh = null;

    this._init();
  }

  getMesh() {
    return this._mesh;
  }

  getType() {
    return this._type;
  }

  disableActivity() {
    this._mesh.userData['isActive'] = false;
  }

  enableActivity() {
    this._mesh.userData['isActive'] = true;
  }

  setInserted() {
    this._isInserted = true;
  }

  setNotInserted() {
    this._isInserted = false;
  }

  isInserted() {
    return this._isInserted;
  }

  setStandardTexture() {
    this._mesh.material.map = this._standardTexture;
  }

  setInPocketTexture() {
    this._mesh.material.map = this._inPocketTexture;
  }

  _init() {
    const model = Loader.assets['game-boy-cartridge'].scene.clone();
    this.add(model);

    const standardTexture = this._standardTexture = Loader.assets[this._config.texture];
    standardTexture.flipY = false;

    const inPocketTexture = this._inPocketTexture = Loader.assets[this._config.textureInPocket];
    inPocketTexture.flipY = false;

    const material = new THREE.MeshBasicMaterial({
      map: standardTexture,
    });

    const mesh = this._mesh = model.children[0];
    mesh.material = material;

    mesh.userData['isActive'] = true;
    mesh.userData['sceneObjectType'] = this._sceneObjectType;
    mesh.userData['partType'] = this._type;
    mesh.userData['showOutline'] = true;
  }
}
