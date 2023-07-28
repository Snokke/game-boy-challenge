import * as PIXI from 'pixi.js';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import GameScreenAbstract from '../game-screen-abstract';
import Delayed from '../../../../../../../core/helpers/delayed-call';
import { SCREEN_TYPE } from '../../data/tetris-data';

export default class LicenseScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._screenType = SCREEN_TYPE.License;
    this._delay = null;

    this._init();
  }

  show() {
    super.show();

    this._delay = Delayed.call(2000, () => {
      this.events.emit('onComplete');
    });
  }

  stopTweens() {
    if (this._delay) {
      this._delay.stop();
    }
  }

  _init() {
    const texture = Loader.assets['ui_assets/tetris/license-screen'];

    const screen = new PIXI.Sprite(texture);
    this.addChild(screen);
    screen.tint = GAME_BOY_CONFIG.screen.tint;
  }
}
