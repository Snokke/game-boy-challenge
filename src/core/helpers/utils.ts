import * as THREE from 'three';
import Loader from "../loader";
import { GLTF } from 'three/examples/jsm/Addons.js';

const boundingBox = new THREE.Box3();

export default class Utils {
  static createObject(name: string): THREE.Group {
    const object = Loader.assets[name] as GLTF;

    if (!object) {
      throw new Error(`Object ${name} is not found.`);
    }

    const group = new THREE.Group();
    const children: THREE.Object3D[] = [...object.scene.children];

    for (let i = 0; i < children.length; i += 1) {
      const child: THREE.Object3D = children[i];
      group.add(child);
    }

    return group;
  }

  static getBoundingBox(target: THREE.Object3D): THREE.Vector3 {
    boundingBox.setFromObject(target);
    const size: THREE.Vector3 = boundingBox.getSize(new THREE.Vector3());

    return size;
  }
}
