import { Container, Sprite, EventEmitter } from "pixi.js";
import DEBUG_CONFIG from "../core/configs/debug-config";
import { SOUNDS_CONFIG } from "../core/configs/sounds-config";
import Loader from "../core/loader";

export default class SoundIcon extends Container {
  constructor() {
    super();

    this.events = new EventEmitter();

    this._view = null;

    this._init();
  }

  updateTexture() {
    this._view.texture = Loader.assets[this._getTexture()];
  }

  _init() {
    this._initView();
    this._initSignals();

    if (DEBUG_CONFIG.withoutUIMode) {
      this.visible = false;
    }
  }

  _initView() {
    const texture = Loader.assets['assets/other/sound-icon'];
    const view = this._view = new Sprite(texture);
    this.addChild(view);

    view.anchor.set(0.5);
    view.eventMode = 'static';
    view.cursor = 'pointer';

    view.scale = 0.4;
  }

  _getTexture() {
    return SOUNDS_CONFIG.enabled ? 'assets/other/sound-icon' : 'assets/other/sound-icon-mute';
  }

  _initSignals() {
    this._view.on('pointerdown', () => {
      SOUNDS_CONFIG.enabled = !SOUNDS_CONFIG.enabled;
      this.updateTexture();
      this.events.emit('onSoundChanged');
    });
  }
}
