import { Sprite, Spritesheet, Texture } from 'pixi.js';
import Loader from '../../../../../../../core/loader';
import GameScreenAbstract from '../../../shared/game-screen-abstract';
import { TETRIS_SCREEN_TYPE } from '../../data/tetris-data';
import { Timeout } from '../../../../../../../core/helpers/timeout';

export default class LicenseScreen extends GameScreenAbstract {
  private delay: any;
  protected screenType: string = TETRIS_SCREEN_TYPE.License;

  constructor() {
    super();

    this.delay = null;

    this.init();
  }

  public show(): void {
    super.show();

    this.delay = Timeout.call(2000, () => {
      this.events.emit('onComplete');
    });
  }

  public stopTweens(): void {
    if (this.delay) {
      this.delay.stop();
    }
  }

  public update(): void { }

  public onButtonPress(): void { }

  public onButtonUp(): void { }

  private init(): void {
    const spriteSheet = Loader.assets['assets/spritesheets/tetris-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['license-screen.png'] as Texture;

    const screen = new Sprite(texture);
    this.addChild(screen);
  }
}
