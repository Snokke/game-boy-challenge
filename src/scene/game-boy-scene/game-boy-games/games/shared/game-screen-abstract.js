import { Container, EventEmitter } from "pixi.js";

export default class GameScreenAbstract extends Container {
  constructor() {
    super();

    this.events = new EventEmitter();

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
