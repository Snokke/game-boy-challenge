import * as THREE from 'three';
import Loader from '../../../core/loader';
import { CARTRIDGES_BY_TYPE_CONFIG } from './data/cartridges-config';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';
import { CARTRIDGE_TYPE } from './data/cartridges-config';
import { GLTF } from 'three/examples/jsm/Addons.js';

export default class Cartridge extends THREE.Group {
  private cartridgeType: CARTRIDGE_TYPE;
  private config: any;
  private sceneObjectType: SCENE_OBJECT_TYPE;
  private isCartridgeInserted: boolean;
  private mesh: THREE.Mesh;
  private standardTexture: THREE.Texture;
  private inPocketTexture: THREE.Texture;

  public startPosition: THREE.Vector3 = new THREE.Vector3();
  public lastRotation: THREE.Euler = new THREE.Euler();

  constructor(type: CARTRIDGE_TYPE) {
    super();

    this.cartridgeType = type;
    this.config = CARTRIDGES_BY_TYPE_CONFIG[type];
    this.sceneObjectType = SCENE_OBJECT_TYPE.Cartridges;
    this.isCartridgeInserted = false;

    this.init();
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public getType(): CARTRIDGE_TYPE {
    return this.cartridgeType;
  }

  public disableActivity(): void {
    this.mesh.userData['isActive'] = false;
  }

  public enableActivity(): void {
    this.mesh.userData['isActive'] = true;
  }

  public setInserted(): void {
    this.isCartridgeInserted = true;
  }

  public setNotInserted(): void {
    this.isCartridgeInserted = false;
  }

  public isInserted(): boolean {
    return this.isCartridgeInserted;
  }

  public setStandardTexture(): void {
    (this.mesh.material as THREE.MeshBasicMaterial).map = this.standardTexture;
  }

  public setInPocketTexture(): void {
    (this.mesh.material as THREE.MeshBasicMaterial).map = this.inPocketTexture;
  }

  private init(): void {
    const gltfModel: GLTF = Loader.assets['game-boy-cartridge'] as GLTF;
    const model: THREE.Group = gltfModel.scene.clone();
    this.add(model);

    const standardTexture = this.standardTexture = Loader.assets[this.config.texture] as THREE.Texture;
    standardTexture.flipY = false;

    const inPocketTexture = this.inPocketTexture = Loader.assets[this.config.textureInPocket] as THREE.Texture;
    inPocketTexture.flipY = false;

    const material = new THREE.MeshBasicMaterial({
      map: standardTexture,
    });

    const mesh = this.mesh = model.children[0] as THREE.Mesh;
    mesh.material = material;

    mesh.userData['isActive'] = true;
    mesh.userData['sceneObjectType'] = this.sceneObjectType;
    mesh.userData['partType'] = this.cartridgeType;
    mesh.userData['showOutline'] = true;
  }
}
