import * as PIXI from 'pixi.js';
import Loader from '../../../core/loader';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config';

export default class LoadingScreen extends PIXI.Container {
  constructor() {
    super();

    this._logo = null;
    this._direction = 1;

    this._init();
  }

  update(dt) {
    this._logo.y += this._direction * 0.5 * dt * 60;

    if (this._logo.y > GAME_BOY_CONFIG.screen.height - 10 || this._logo.y < 10) {
      this._direction *= -1;
      this._logo.y += this._direction * 0.5 * dt * 60;
    }
  }

  show() {
    this.visible = true;
    this._logo.y = GAME_BOY_CONFIG.screen.height * 0.5;
  }

  hide() {
    this.visible = false;
  }

  _init() {
    const texture = Loader.assets['ui_assets/nintendo-logo-screen'];

    const logo = this._logo = new PIXI.Sprite(texture);
    logo.anchor.set(0.5);
    this.addChild(logo);

    logo.x = GAME_BOY_CONFIG.screen.width * 0.5;
    logo.y = GAME_BOY_CONFIG.screen.height * 0.5;

    this.hide();
  }
}
