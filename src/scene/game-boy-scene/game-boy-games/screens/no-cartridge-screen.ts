import { Text } from 'pixi.js';
import { GAME_BOY_CONFIG } from '../../game-boy/data/game-boy-config';
import ScreenAbstract from './screen-abstract';

export default class NoCartridgeScreen extends ScreenAbstract {
  constructor() {
    super();

    this.init();
  }

  private init(): void {
    this.initText();

    this.visible = false;
  }

  private initText(): void {
    const text: Text = new Text({
      text: 'insert cartridge',
      style: {
        fontFamily: 'tetris',
        fontSize: 8,
        fill: 0x00000,
      },
    });

    this.addChild(text);
    text.anchor.set(0.5, 0);

    text.x = GAME_BOY_CONFIG.screen.width * 0.5;
    text.y = GAME_BOY_CONFIG.screen.height * 0.5 - 5;
  }
}
