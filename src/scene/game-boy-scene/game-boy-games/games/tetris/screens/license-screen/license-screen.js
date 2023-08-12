import * as PIXI from 'pixi.js';
import Loader from '../../../../../../../core/loader';
import GameScreenAbstract from '../../../shared/game-screen-abstract';
import Delayed from '../../../../../../../core/helpers/delayed-call';
import { TETRIS_SCREEN_TYPE } from '../../data/tetris-data';

export default class LicenseScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._screenType = TETRIS_SCREEN_TYPE.License;
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
    const spriteSheet = Loader.assets['assets/spritesheets/tetris-sheet'];
    const texture = spriteSheet.textures['license-screen.png'];

    const screen = new PIXI.Sprite(texture);
    this.addChild(screen);
  }
}
