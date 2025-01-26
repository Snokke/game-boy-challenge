import { Text } from 'pixi.js';
import { GAME_BOY_CONFIG } from '../../game-boy/data/game-boy-config';
import ScreenAbstract from './screen-abstract';

export default class NoCartridgeScreen extends ScreenAbstract {
  constructor() {
    super();

    this._init();
  }

  _init() {
    this._initText();

    this.visible = false;
  }

  _initText() {
    const text = new Text({
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
