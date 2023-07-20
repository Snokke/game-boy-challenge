import * as THREE from 'three';
import Loader from './loader';

export default class Materials {
  constructor() {

    this.bakedMaterial = null;

    this._initMaterials();

    Materials.instance = this;
  }

  _initMaterials() {
    // this._initBakedTexture();
  }

  _initBakedTexture() {
    const bakedTexture = Loader.assets[''];
    bakedTexture.flipY = false;

    this.bakedMaterial = new THREE.MeshBasicMaterial({
      map: bakedTexture,
    });
  }

  static getMaterial(type) {
    let material;

    switch (type) {
      case Materials.type.bakedMaterial:
        material = Materials.instance.bakedMaterial;
        break;
    }

    return material;
  }
}

Materials.instance = null;

Materials.type = {
  bakedMaterial: 'BAKED_MATERIAL',
};
