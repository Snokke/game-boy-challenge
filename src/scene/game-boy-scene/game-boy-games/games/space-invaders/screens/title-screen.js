import * as PIXI from "pixi.js";
import Loader from "../../../../../../core/loader";
import { GAME_BOY_CONFIG } from "../../../../game-boy/data/game-boy-config";
import GameScreenAbstract from "../../shared/game-screen-abstract";
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from "../../../../../../core/helpers/delayed-call";
import { BUTTON_TYPE } from "../../../../game-boy/data/game-boy-data";


export default class TitleScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._logo = null;
    this._logoTween = null;
    this._titleScreenClean = null;
    this._startText = null;
    this._blinkTimer = null;
    this._isButtonsEnabled = false;

    this._blinkTime = 700;

    this._init();
  }

  show() {
    super.show();

    this._showLogo();
  }

  hide() {
    super.hide();

    this.stopTweens();
    this.reset();
  }

  onButtonPress(buttonType) {
    if (!this._isButtonsEnabled) {
      return;
    }

    if (buttonType === BUTTON_TYPE.Start || buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.B) {
      this.events.emit('onStartGame');
    }
  }


  stopTweens() {
    if (this._logoTween) {
      this._logoTween.stop();
    }

    if (this._blinkTimer) {
      this._blinkTimer.stop();
    }
  }

  reset() {
    this._logo.y = 145;
    this._titleScreenClean.visible = false;
    this._startText.visible = false;
    this._isButtonsEnabled = false;
  }

  _showLogo() {
    this._logoTween = new TWEEN.Tween(this._logo)
      .to({ y: 20 }, 1500)
      .easing(TWEEN.Easing.Linear.None)
      .start()
      .onComplete(() => {
        this._titleScreenClean.visible = true;
        this._startText.visible = true;
        this._isButtonsEnabled = true;
        this._blinkStartText();
      });
  }

  _blinkStartText() {
    this._blinkTimer = Delayed.call(this._blinkTime, () => {
      this._startText.visible = !this._startText.visible;
      this._blinkStartText();
    });
  }

  _init() {
    this._initLogo();
    this._initTitleScreenClean();
    this._initStartText();

    this.visible = false;
  }

  _initLogo() {
    const texture = Loader.assets['ui_assets/space-invaders/space-invaders-logo'];

    const logo = this._logo = new PIXI.Sprite(texture);
    this.addChild(logo);
    logo.tint = GAME_BOY_CONFIG.screen.tint;

    logo.x = 9;
    logo.y = 145;
  }

  _initTitleScreenClean() {
    const texture = Loader.assets['ui_assets/space-invaders/title-screen-clean'];

    const titleScreenClean = this._titleScreenClean = new PIXI.Sprite(texture);
    this.addChild(titleScreenClean);
    titleScreenClean.tint = GAME_BOY_CONFIG.screen.tint;

    titleScreenClean.visible = false;
  }

  _initStartText() {
    const texture = Loader.assets['ui_assets/space-invaders/start-text'];

    const startText = this._startText = new PIXI.Sprite(texture);
    this.addChild(startText);
    startText.tint = GAME_BOY_CONFIG.screen.tint;

    startText.x = 41;
    startText.y = 83;
    startText.visible = false;
  }
}
