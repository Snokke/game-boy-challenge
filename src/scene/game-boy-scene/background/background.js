import * as THREE from 'three';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';
import { MessageDispatcher } from 'black-engine';

export default class Background extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._view = null;
    this._sceneObjectType = SCENE_OBJECT_TYPE.Background;

    this._init();
  }

  onPointerDown(object) {
    this.events.post('onClick');
  }

  getMesh() {
    return this._view;
  }

  getOutlineMeshes(object) {
    return [object];
  }

  onPointerOver() { }

  _init() {
    const geometry = new THREE.PlaneGeometry(50, 25);
    const material = new THREE.MeshBasicMaterial({
      color: 0x999999,
    });

    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.userData['isActive'] = true;
    view.userData['sceneObjectType'] = this._sceneObjectType;
    view.userData['showOutline'] = false;

    view.position.set(0, 0, -15);
  }
}
