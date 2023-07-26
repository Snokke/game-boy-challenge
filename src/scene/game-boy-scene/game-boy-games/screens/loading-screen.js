import * as PIXI from 'pixi.js';
import Loader from '../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../game-boy/data/game-boy-config';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';

export default class LoadingScreen extends PIXI.Container {
  constructor() {
    super();

    this.events = new PIXI.utils.EventEmitter();

    this._logo = null;
    this._movingTween = null;
    this._delayToStart = null;

    this._init();
  }

  show() {
    this.visible = true;

    this.stopTweens();
    this._logo.y = -15;

    this._movingTween = new TWEEN.Tween(this._logo)
      .to({ y: GAME_BOY_CONFIG.screen.height * 0.5 }, 2500)
      .easing(TWEEN.Easing.Linear.None)
      .start()
      .onComplete(() => {
        this._delayToStart = Delayed.call(1000, () => {
          this.hide();
          this.events.emit('onComplete');
        });
      });
  }

  hide() {
    this.visible = false;

    this.stopTweens();
  }

  stopTweens() {
    if (this._movingTween) {
      this._movingTween.stop();
    }

    if (this._delayToStart) {
      this._delayToStart.stop();
    }
  }

  _init() {
    const texture = Loader.assets['ui_assets/nintendo-logo-screen'];

    const logo = this._logo = new PIXI.Sprite(texture);
    logo.anchor.set(0.5);
    this.addChild(logo);

    logo.tint = GAME_BOY_CONFIG.screen.tint;

    logo.x = GAME_BOY_CONFIG.screen.width * 0.5;
    logo.y = GAME_BOY_CONFIG.screen.height * 0.5;

    this.hide();
  }
}
