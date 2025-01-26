import { Container } from "pixi.js";

export default class ScreenAbstract extends Container {
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
