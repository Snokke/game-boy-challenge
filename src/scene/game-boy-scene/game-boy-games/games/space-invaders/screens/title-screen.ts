import { Sprite, Spritesheet, Texture } from 'pixi.js';
import Loader from "../../../../../../core/loader";
import GameScreenAbstract from "../../shared/game-screen-abstract";
import TWEEN from 'three/addons/libs/tween.module.js';
import { BUTTON_TYPE } from "../../../../game-boy/data/game-boy-data";
import { Timeout, TimeoutInstance } from '../../../../../../core/helpers/timeout';

export default class TitleScreen extends GameScreenAbstract {
  private logo: Sprite;
  private logoTween: any;
  private titleScreenClean: Sprite;
  private startText: Sprite;
  private blinkTimer: TimeoutInstance;
  private isButtonsEnabled: boolean;
  private blinkTime: number;

  constructor() {
    super();

    this.logo = null;
    this.logoTween = null;
    this.titleScreenClean = null;
    this.startText = null;
    this.blinkTimer = null;
    this.isButtonsEnabled = false;

    this.blinkTime = 700;

    this.init();
  }

  public show(): void {
    super.show();

    this.showLogo();
  }

  public hide() {
    super.hide();

    this.stopTweens();
    this.reset();
  }

  public onButtonPress(buttonType: BUTTON_TYPE): void {
    if (!this.isButtonsEnabled) {
      return;
    }

    if (buttonType === BUTTON_TYPE.Start || buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.B) {
      this.events.emit('onStartGame');
    }
  }

  public stopTweens(): void {
    if (this.logoTween) {
      this.logoTween.stop();
    }

    if (this.blinkTimer) {
      this.blinkTimer.stop();
    }
  }

  public reset(): void {
    this.logo.y = 145;
    this.titleScreenClean.visible = false;
    this.startText.visible = false;
    this.isButtonsEnabled = false;
  }

  private showLogo(): void {
    this.logoTween = new TWEEN.Tween(this.logo)
      .to({ y: 20 }, 1500)
      .easing(TWEEN.Easing.Linear.None)
      .start()
      .onComplete(() => {
        this.titleScreenClean.visible = true;
        this.startText.visible = true;
        this.isButtonsEnabled = true;
        this.blinkStartText();
      });
  }

  private blinkStartText(): void {
    this.blinkTimer = Timeout.call(this.blinkTime, () => {
      this.startText.visible = !this.startText.visible;
      this.blinkStartText();
    });
  }

  private init(): void {
    this.initLogo();
    this.initTitleScreenClean();
    this.initStartText();

    this.visible = false;
  }

  private initLogo(): void {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['space-invaders-logo.png'] as Texture;

    const logo: Sprite = this.logo = new Sprite(texture);
    this.addChild(logo);

    logo.x = 9;
    logo.y = 145;
  }

  private initTitleScreenClean(): void {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['title-screen-clean.png'] as Texture;

    const titleScreenClean: Sprite = this.titleScreenClean = new Sprite(texture);
    this.addChild(titleScreenClean);

    titleScreenClean.visible = false;
  }

  private initStartText(): void {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['start-text.png'] as Texture;

    const startText: Sprite = this.startText = new Sprite(texture);
    this.addChild(startText);

    startText.x = 41;
    startText.y = 83;
    startText.visible = false;
  }
}
