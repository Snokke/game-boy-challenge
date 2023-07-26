import * as PIXI from 'pixi.js';

export default class ScreenAbstract extends PIXI.Container {
  constructor() {
    super();

    this.events = new PIXI.utils.EventEmitter();

    this._screenType = null;

    this.visible = false;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  getScreenType() {
    return this._screenType;
  }

  onButtonPress(buttonType) { }

  reset() { }

  stopTweens() { }
}
