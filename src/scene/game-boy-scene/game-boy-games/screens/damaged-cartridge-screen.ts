import { Sprite, Container, Text, Texture } from 'pixi.js';
import { GAME_BOY_CONFIG } from '../../game-boy/data/game-boy-config';
import Loader from '../../../../core/loader';
import ScreenAbstract from './screen-abstract';

export default class DamagedCartridgeScreen extends ScreenAbstract {
  constructor() {
    super();

    this.init();
  }

  private init(): void {
    this.initStopSign();
    this.initText();

    this.visible = false;
  }

  private initStopSign(): void {
    const texture: Texture = Loader.assets['assets/other/stop-sign'] as Texture;

    const stopSign: Sprite = new Sprite(texture);
    this.addChild(stopSign);

    stopSign.anchor.set(0.5);

    stopSign.x = GAME_BOY_CONFIG.screen.width * 0.5;
    stopSign.y = GAME_BOY_CONFIG.screen.height * 0.5 - 20;
  }

  private initText(): void {
    const textContainer: Container = new Container();
    this.addChild(textContainer);

    const textLine01: Text = this.createTextLine('The cartridge');
    const textLine02: Text = this.createTextLine('is not working');
    textContainer.addChild(textLine01, textLine02);

    textLine01.y = -5;
    textLine02.y = 5;

    textContainer.x = GAME_BOY_CONFIG.screen.width * 0.5;
    textContainer.y = GAME_BOY_CONFIG.screen.height * 0.5 + 30;
  }

  private createTextLine(string: string): Text {
    const text = new Text({
      text: string,
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });

    text.anchor.set(0.5, 0);

    return text;
  }
}
