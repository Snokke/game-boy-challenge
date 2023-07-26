import * as PIXI from 'pixi.js';
import Loader from '../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../game-boy/data/game-boy-config';

export default class TitleScreen extends PIXI.Container {
  constructor() {
    super();

    this._init();
  }

  _init() {
    const texture = Loader.assets['ui_assets/tetris/title-screen'];

    const screen = new PIXI.Sprite(texture);
    this.addChild(screen);
    screen.tint = GAME_BOY_CONFIG.screen.tint;

    // const text = new PIXI.Text('1 PLAYER', new PIXI.TextStyle({ fontFamily: 'tetris', fontSize: 8 }));
    // this.addChild(text);

    // text.x = 16;
    // text.y = 120;
  }
}
