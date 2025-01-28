import { Container, EventEmitter } from "pixi.js";
import Overlay from "./overlay";
import SoundIcon from "./sound-icon";

export default class UI extends Container {
  constructor(pixiApp) {
    super();

    this.events = new EventEmitter();

    this._pixiApp = pixiApp;
    this._overlay = null;
    this._soundIcon = null;

    this._init();
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this._soundIcon.x = 50;
    this._soundIcon.y = 50;

    this._overlay.onResize(width, height);
  }

  updateSoundIcon() {
    this._soundIcon.updateTexture();
  }

  _init() {
    this._initOverlay();
    this._initSoundIcon();
    this._initSignals();

    this.onResize();
  }

  _initOverlay() {
    const overlay = this._overlay = new Overlay();
    this.addChild(overlay);
  }

  _initSoundIcon() {
    const soundIcon = this._soundIcon = new SoundIcon();
    this.addChild(soundIcon);
  }

  _initSignals() {
    this._overlay.events.on('onPointerMove', (x, y) => this.events.emit('onPointerMove', x, y));
    this._overlay.events.on('onPointerDown', (x, y) => this.events.emit('onPointerDown', x, y));
    this._overlay.events.on('onPointerUp', (x, y) => this.events.emit('onPointerUp', x, y));
    this._pixiApp.canvas.addEventListener('wheel', event => this.events.emit('onWheelScroll', Math.sign(event.deltaY)));

    this._soundIcon.events.on('onSoundChanged', () => this.events.emit('onSoundChanged'));
  }
}
