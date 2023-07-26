import * as PIXI from 'pixi.js';

export default class GameAbstract extends PIXI.Container {
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

  stopTweens() {}

  reset() { }

  onButtonPress(buttonType) { }
}
