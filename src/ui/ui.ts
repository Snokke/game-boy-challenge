import { Container, EventEmitter, Application } from "pixi.js";
import Overlay from "./overlay";
import SoundIcon from './sound-icon';

export default class UI extends Container {
  public events: EventEmitter;

  private pixiApp: Application;
  private overlay: Overlay;
  private soundIcon: SoundIcon;

  constructor(pixiApp: Application) {
    super();

    this.events = new EventEmitter();

    this.pixiApp = pixiApp;

    this.init();
  }

  public onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.soundIcon.x = 50;
    this.soundIcon.y = 50;

    this.overlay.onResize(width, height);
  }

  public updateSoundIcon(): void {
    this.soundIcon.updateTexture();
  }

  private init(): void {
    this.initOverlay();
    this.initSoundIcon();
    this.initSignals();

    this.onResize();
  }

  private initOverlay(): void {
    const overlay = this.overlay = new Overlay();
    this.addChild(overlay);
  }

  private initSoundIcon(): void {
    const soundIcon = this.soundIcon = new SoundIcon();
    this.addChild(soundIcon);
  }

  private initSignals(): void {
    this.overlay.events.on('onPointerMove', (x: number, y: number) => this.events.emit('onPointerMove', x, y));
    this.overlay.events.on('onPointerDown', (x: number, y: number) => this.events.emit('onPointerDown', x, y));
    this.overlay.events.on('onPointerUp', (x: number, y: number) => this.events.emit('onPointerUp', x, y));
    this.pixiApp.canvas.addEventListener('wheel', (event: WheelEvent) => this.events.emit('onWheelScroll', Math.sign(event.deltaY)));

    this.soundIcon.events.on('onSoundChanged', () => this.events.emit('onSoundChanged'));
  }
}
