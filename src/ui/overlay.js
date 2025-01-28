import { Container, Sprite, EventEmitter } from "pixi.js";
import Loader from "../core/loader";

export default class Overlay extends Container {
  constructor() {
    super();

    this.events = new EventEmitter();

    this._view = null;

    this._init();
  }

  onResize(width, height) {
    this._view.x = 0;
    this._view.y = 0;

    const overlaySize = 10;
    this._view.scale.x = width / overlaySize;
    this._view.scale.y = height / overlaySize;
  }

  _init() {
    this._initView();
    this._initSignals();
  }

  _initView() {
    const texture = Loader.assets['assets/other/overlay'];
    const view = this._view = new Sprite(texture);
    this.addChild(view);

    view.alpha = 0;
    view.eventMode = 'static';
  }

  _initSignals() {
    this._view.on('pointerdown', (pointer) => {
      if (pointer.button === 0) {
        this.events.emit('onPointerDown', pointer.x, pointer.y);
      }
    });

    this._view.on('pointerup', (pointer) => {
      if (pointer.button === 0) {
        this.events.emit('onPointerUp', pointer.x, pointer.y);
      }
    });

    this._view.on('pointermove', (pointer) => {
      this.events.emit('onPointerMove', pointer.x, pointer.y);
    });
  }
}
