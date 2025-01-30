import { Container, Sprite, EventEmitter, Texture, FederatedPointerEvent } from "pixi.js";
import Loader from "../core/loader";

export default class Overlay extends Container {
  public events: EventEmitter;

  private view: Sprite;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.init();
  }

  public onResize(width: number, height: number): void {
    this.view.x = 0;
    this.view.y = 0;

    const overlaySize = 10;
    this.view.scale.x = width / overlaySize;
    this.view.scale.y = height / overlaySize;
  }

  private init(): void {
    this.initView();
    this.initSignals();
  }

  private initView(): void {
    const texture = Loader.assets['assets/other/overlay'] as Texture;
    const view = this.view = new Sprite(texture);
    this.addChild(view);

    view.alpha = 0;
    view.eventMode = 'static';
  }

  private initSignals(): void {
    this.view.on('pointerdown', (pointer: FederatedPointerEvent) => {
      if (pointer.button === 0) {
        this.events.emit('onPointerDown', pointer.x, pointer.y);
      }
    });

    this.view.on('pointerup', (pointer: FederatedPointerEvent) => {
      if (pointer.button === 0) {
        this.events.emit('onPointerUp', pointer.x, pointer.y);
      }
    });

    this.view.on('pointermove', (pointer: FederatedPointerEvent) => {
      this.events.emit('onPointerMove', pointer.x, pointer.y);
    });
  }
}
