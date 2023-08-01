import * as PIXI from 'pixi.js';

export default class GameScreenAbstract extends PIXI.Container {
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

  update(dt) { }

  onButtonPress(buttonType) { }

  onButtonUp(buttonType) { }

  reset() { }

  stopTweens() { }
}
