import * as PIXI from 'pixi.js';
import { GAME_BOY_CONFIG } from '../../game-boy/data/game-boy-config';
import Loader from '../../../../core/loader';
import ScreenAbstract from './screen-abstract';

export default class DamagedCartridgeScreen extends ScreenAbstract {
  constructor() {
    super();

    this._init();
  }

  _init() {
    this._initStopSign();
    this._initText();

    this.visible = false;
  }

  _initStopSign() {
    const texture = Loader.assets['ui_assets/stop-sign'];

    const stopSign = new PIXI.Sprite(texture);
    this.addChild(stopSign);

    stopSign.anchor.set(0.5);

    stopSign.x = GAME_BOY_CONFIG.screen.width * 0.5;
    stopSign.y = GAME_BOY_CONFIG.screen.height * 0.5 - 20;
  }

  _initText() {
    const textContainer = new PIXI.Container();
    this.addChild(textContainer);

    const textLine01 = this._createTextLine('The cartridge');
    const textLine02 = this._createTextLine('is not working');
    textContainer.addChild(textLine01, textLine02);

    textLine01.y = -5;
    textLine02.y = 5;

    textContainer.x = GAME_BOY_CONFIG.screen.width * 0.5;
    textContainer.y = GAME_BOY_CONFIG.screen.height * 0.5 + 30;
  }

  _createTextLine(string) {
    const text = new PIXI.Text(string, new PIXI.TextStyle({
      fontFamily: 'tetris',
      fontSize: 8,
      fill: 0x000000,
    }));

    text.anchor.set(0.5, 0);

    return text;
  }
}
