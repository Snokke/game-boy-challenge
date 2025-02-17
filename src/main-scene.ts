import * as THREE from 'three';
import { EventEmitter } from 'pixi.js';
import Scene3D from "./scene/scene3d";
import UI from './ui/ui';

export default class MainScene {
  public events: EventEmitter;

  private data: any;
  private scene: THREE.Scene;
  private scene3D: Scene3D;
  private ui: UI;

  constructor(data: any) {
    this.events = new EventEmitter();

    this.data = data;
    this.scene = data.scene;

    this.init();
  }

  public onResize(): void {
    this.ui.onResize();
  }

  public afterAssetsLoad(): void {
    this.data.pixiApp.stage.addChild(this.ui);
    this.scene.add(this.scene3D);
  }

  public update(dt: number): void {
    this.scene3D.update(dt);
  }

  private init(): void {
    this.scene3D = new Scene3D(this.data);
    this.ui = new UI(this.data.pixiApp);

    this.initSignals();
  }

  private initSignals() {
    this.ui.events.on('onPointerMove', (x: number, y: number) => this.scene3D.onPointerMove(x, y));
    this.ui.events.on('onPointerDown', (x: number, y: number) => this.scene3D.onPointerDown(x, y));
    this.ui.events.on('onPointerUp', () => this.scene3D.onPointerUp());
    this.ui.events.on('onWheelScroll', (delta: number) => this.scene3D.onWheelScroll(delta));
    this.ui.events.on('onSoundChanged', () => this.scene3D.onSoundChanged());

    this.scene3D.events.on('fpsMeterChanged', () => this.events.emit('fpsMeterChanged'));
    this.scene3D.events.on('onSoundsEnabledChanged', () => this.ui.updateSoundIcon());
  }
}
