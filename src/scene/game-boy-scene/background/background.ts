import * as THREE from 'three';
import { EventEmitter } from 'pixi.js';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';
import Loader from '../../../core/loader';

export default class Background extends THREE.Group {
  public events: EventEmitter;

  private view: THREE.Mesh;
  private sceneObjectType: SCENE_OBJECT_TYPE;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.sceneObjectType = SCENE_OBJECT_TYPE.Background;

    this.init();
  }

  public onPointerDown(): void {
    this.events.emit('onClick');
  }

  public getMesh(): THREE.Mesh {
    return this.view;
  }

  public getOutlineMeshes(object: THREE.Object3D): THREE.Object3D[] {
    return [object];
  }

  public onPointerOver(): void { }

  init(): void {
    const texture: THREE.Texture = Loader.assets['background'] as THREE.Texture;

    const geometry = new THREE.PlaneGeometry(50, 50);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    const view = this.view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.userData['isActive'] = true;
    view.userData['sceneObjectType'] = this.sceneObjectType;
    view.userData['showOutline'] = false;

    view.position.set(0, 0, -15);
  }
}
