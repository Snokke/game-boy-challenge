import * as PIXI from 'pixi.js';

export default class ScreenAbstract extends PIXI.Container {
  constructor() {
    super();
  }

  update(dt) { }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  stopTweens() { }

  onButtonPress(buttonType) { }

  onButtonUp(buttonType) { }
}
