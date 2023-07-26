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
  }
}
