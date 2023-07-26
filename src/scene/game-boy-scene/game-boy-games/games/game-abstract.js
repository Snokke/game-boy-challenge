import * as PIXI from 'pixi.js';

export default class GameAbstract extends PIXI.Container {
  constructor() {
    super();

  }

  update(dt) { }

  start() {
    this.visible = true;
  }

  stop() {
    this.visible = false;
  }

  onButtonPress(buttonType) { }
}
