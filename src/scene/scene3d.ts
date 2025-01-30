import * as THREE from 'three';
import { EventEmitter } from 'pixi.js';
import RaycasterController from './raycaster-controller';
import GameBoyScene from './game-boy-scene/game-boy-scene';

export default class Scene3D extends THREE.Group {
  public events: EventEmitter;

  private data: any;
  private camera: THREE.Camera;
  private raycasterController: RaycasterController;
  private gameBoyScene: GameBoyScene;

  constructor(data: any) {
    super();

    this.events = new EventEmitter();

    this.data = data;
    this.camera = data.camera;

    this.init();
  }

  public update(dt: number): void {
    this.gameBoyScene.update(dt);
  }

  public onPointerMove(x: number, y: number): void {
    this.gameBoyScene.onPointerMove(x, y);
  }

  public onPointerDown(x: number, y: number): void {
    this.gameBoyScene.onPointerDown(x, y);
  }

  public onPointerUp(x: number, y: number): void {
    this.gameBoyScene.onPointerUp(x, y);
  }

  public onPointerLeave(): void {
    this.gameBoyScene.onPointerLeave();
  }

  public onWheelScroll(delta: number): void {
    this.gameBoyScene.onWheelScroll(delta);
  }

  public onSoundChanged(): void {
    this.gameBoyScene.onSoundChanged();
  }

  private init(): void {
    this.initRaycaster();
    this.initGameBoy();
    this.initSignals();
  }

  private initRaycaster(): void {
    this.raycasterController = new RaycasterController(this.camera);
  }

  private initGameBoy(): void {
    const gameBoyScene = this.gameBoyScene = new GameBoyScene(this.data, this.raycasterController);
    this.add(gameBoyScene);
  }

  private initSignals(): void {
    this.gameBoyScene.events.on('fpsMeterChanged', () => this.events.emit('fpsMeterChanged'));
    this.gameBoyScene.events.on('onSoundsEnabledChanged', () => this.events.emit('onSoundsEnabledChanged'));
  }
}
