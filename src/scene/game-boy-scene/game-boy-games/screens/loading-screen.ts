import { Sprite, EventEmitter, Texture } from 'pixi.js';
import Loader from '../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../game-boy/data/game-boy-config';
import TWEEN from 'three/addons/libs/tween.module.js';
import ScreenAbstract from './screen-abstract';
import GameBoyAudio from '../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../game-boy/game-boy-audio/game-boy-audio-data';
import { Timeout, TimeoutInstance } from '../../../../core/helpers/timeout';

export default class LoadingScreen extends ScreenAbstract {
  public events: EventEmitter;

  private logo: Sprite;
  private movingTween: any;
  private delayToStart: TimeoutInstance;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.logo = null;
    this.movingTween = null;
    this.delayToStart = null;

    this.init();
  }

  public show(): void {
    this.visible = true;

    this.stopTweens();
    this.logo.y = -15;

    this.movingTween = new TWEEN.Tween(this.logo)
      .to({ y: GAME_BOY_CONFIG.screen.height * 0.5 }, 2500)
      .easing(TWEEN.Easing.Linear.None)
      .start()
      .onComplete((): void => {
        GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.GameBoyLoad);

        this.delayToStart = Timeout.call(1000, (): void => {
          this.hide();
          this.events.emit('onComplete');
        });
      });
  }

  public hide(): void {
    this.visible = false;

    this.stopTweens();
  }

  public stopTweens(): void {
    if (this.movingTween) {
      this.movingTween.stop();
    }

    if (this.delayToStart) {
      this.delayToStart.stop();
    }
  }

  private init(): void {
    this.initLogo();

    this.hide();
  }

  private initLogo(): void {
    const texture = Loader.assets['assets/other/nintendo-logo-screen'] as Texture;

    const logo: Sprite = this.logo = new Sprite(texture);
    logo.anchor.set(0.5);
    this.addChild(logo);

    logo.x = GAME_BOY_CONFIG.screen.width * 0.5;
    logo.y = GAME_BOY_CONFIG.screen.height * 0.5;
  }
}
