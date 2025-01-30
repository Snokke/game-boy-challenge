import * as THREE from 'three';

export default class RaycasterController {
  private camera: THREE.Camera;
  private raycaster: THREE.Raycaster;
  private meshes: THREE.Object3D[];

  constructor(camera: THREE.Camera) {
    this.camera = camera;

    this.meshes = [];

    this.init();
  }

  public getRaycaster(): THREE.Raycaster {
    return this.raycaster;
  }

  public checkIntersection(x: number, y: number): THREE.Intersection | null {
    const mousePositionX: number = (x / window.innerWidth) * 2 - 1;
    const mousePositionY: number = -(y / window.innerHeight) * 2 + 1;
    const mousePosition: THREE.Vector2 = new THREE.Vector2(mousePositionX, mousePositionY);

    this.raycaster.setFromCamera(mousePosition, this.camera);
    const intersects: THREE.Intersection[] = this.raycaster.intersectObjects(this.meshes);

    let intersectedObject: THREE.Intersection | null = null;

    if (intersects.length > 0) {
      intersectedObject = intersects[0];
    }

    return intersectedObject;
  }

  public addMeshes(meshes: THREE.Object3D[]): void {
    this.meshes = [...this.meshes, ...meshes];
  }

  private init(): void {
    this.raycaster = new THREE.Raycaster();
  }
}
