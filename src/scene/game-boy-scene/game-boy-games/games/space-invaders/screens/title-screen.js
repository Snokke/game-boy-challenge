import { Sprite } from 'pixi.js';
import Loader from "../../../../../../core/loader";
import GameScreenAbstract from "../../shared/game-screen-abstract";
import TWEEN from 'three/addons/libs/tween.module.js';
import { BUTTON_TYPE } from "../../../../game-boy/data/game-boy-data";
import Timeout from '../../../../../../core/helpers/timeout';


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
    this._blinkTimer = Timeout.call(this._blinkTime, () => {
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
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures['space-invaders-logo.png'];

    const logo = this._logo = new Sprite(texture);
    this.addChild(logo);

    logo.x = 9;
    logo.y = 145;
  }

  _initTitleScreenClean() {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures['title-screen-clean.png'];

    const titleScreenClean = this._titleScreenClean = new Sprite(texture);
    this.addChild(titleScreenClean);

    titleScreenClean.visible = false;
  }

  _initStartText() {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'];
    const texture = spriteSheet.textures['start-text.png'];

    const startText = this._startText = new Sprite(texture);
    this.addChild(startText);

    startText.x = 41;
    startText.y = 83;
    startText.visible = false;
  }
}
