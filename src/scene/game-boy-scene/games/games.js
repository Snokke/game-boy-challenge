import * as PIXI from 'pixi.js';

export default class Games {
  constructor(application) {

    this._application = application;
    this._direction = 1;

    this._init();
  }

  update(dt) {
    this._logo.y += this._direction * 0.5 * dt * 60;

    if (this._logo.y > this._application.screen.height - 10 || this._logo.y < 10) {
      this._direction *= -1;
      this._logo.y += this._direction * 0.5 * dt * 60;
    }
  }

  _init() {
    const container = new PIXI.Container();
    this._application.stage.addChild(container);

    const texture = PIXI.Texture.from('ui_assets/nintendo-logo-screen.png');

    const logo = this._logo = new PIXI.Sprite(texture);
    logo.anchor.set(0.5);
    container.addChild(logo);

    logo.x = this._application.screen.width / 2;
    logo.y = this._application.screen.height / 2;
  }
}
