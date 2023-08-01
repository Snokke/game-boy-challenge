import * as THREE from 'three';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';
import { MessageDispatcher } from 'black-engine';
import Loader from '../../../core/loader';
import vertexShader from './background-shaders/background-vertex.glsl';
import fragmentShader from './background-shaders/background-fragment.glsl';

export default class Background extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._view = null;
    this._sceneObjectType = SCENE_OBJECT_TYPE.Background;

    this._init();
  }

  update(dt) {
    // this._view.material.uniforms.uTime.value += dt;
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

    const geometry = new THREE.PlaneGeometry(50, 50);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      // color: 0x666666, // 0x999999
    });

    // const material = new THREE.ShaderMaterial({
    //   uniforms: {
    //     uTime: { value: 0 },
    //     uAngle: { value: 0 },
    //     color01: { value: new THREE.Color(0x463fcc) },
    //     color02: { value: new THREE.Color(0xca4a75) },
    //   },
    //   vertexShader: vertexShader,
    //   fragmentShader: fragmentShader,
    // });

    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.userData['isActive'] = true;
    view.userData['sceneObjectType'] = this._sceneObjectType;
    view.userData['showOutline'] = false;

    view.position.set(0, 0, -15);
  }
}
