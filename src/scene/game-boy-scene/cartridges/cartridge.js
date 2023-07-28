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

  _init() {
    const model = Loader.assets['game-boy-cartridge'].scene.clone();
    this.add(model);

    const texture = Loader.assets[this._config.labelTexture];
    texture.flipY = false;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    const mesh = this._mesh = model.children[0];
    mesh.material = material;

    mesh.userData['isActive'] = true;
    mesh.userData['sceneObjectType'] = this._sceneObjectType;
    mesh.userData['partType'] = this._type;
    mesh.userData['showOutline'] = true;
  }
}
