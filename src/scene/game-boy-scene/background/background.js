import * as THREE from 'three';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';
import { MessageDispatcher } from 'black-engine';
import Loader from '../../../core/loader';

export default class Background extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._view = null;
    this._sceneObjectType = SCENE_OBJECT_TYPE.Background;

    this._init();
  }

  update(dt) {
    // this._view.material.map.offset.x -= 0.0001;
    // this._view.material.map.offset.y += 0.0001;
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
    const texture = Loader.assets['background'];

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    texture.repeat.set(4, 4);

    const geometry = new THREE.PlaneGeometry(50, 50);
    const material = new THREE.MeshBasicMaterial({
      // map: texture,
      color: 0x666666, // 0x999999
    });

    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.userData['isActive'] = true;
    view.userData['sceneObjectType'] = this._sceneObjectType;
    view.userData['showOutline'] = false;

    view.position.set(0, 0, -15);
  }
}
