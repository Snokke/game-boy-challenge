import { Container, Sprite, EventEmitter, Texture } from "pixi.js";
import DEBUG_CONFIG from "../core/configs/debug-config";
import { SOUNDS_CONFIG } from "../Data/Configs/Main/sounds-config";
import Loader from "../core/loader";

export default class SoundIcon extends Container {
  public events: EventEmitter;
  private view: Sprite;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.init();
  }

  updateTexture(): void {
    this.view.texture = Loader.assets[this.getTexture()] as Texture;
  }

  private init(): void {
    this.initView();
    this.initSignals();

    if (DEBUG_CONFIG.withoutUIMode) {
      this.visible = false;
    }
  }

  private initView(): void {
    const texture = Loader.assets['assets/other/sound-icon'] as Texture;
    const view = this.view = new Sprite(texture);
    this.addChild(view);

    view.anchor.set(0.5);
    view.eventMode = 'static';
    view.cursor = 'pointer';

    view.scale.set(0.4);
  }

  private getTexture(): string {
    return SOUNDS_CONFIG.enabled ? 'assets/other/sound-icon' : 'assets/other/sound-icon-mute';
  }

  private initSignals(): void {
    this.view.on('pointerdown', () => {
      SOUNDS_CONFIG.enabled = !SOUNDS_CONFIG.enabled;
      this.updateTexture();
      this.events.emit('onSoundChanged');
    });
  }
}
