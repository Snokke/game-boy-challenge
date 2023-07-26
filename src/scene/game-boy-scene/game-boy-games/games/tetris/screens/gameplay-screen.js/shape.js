import * as PIXI from 'pixi.js';

export default class Shape extends PIXI.Container {
  constructor(type) {
    super();

    this._type = type;

    this._init();
  }

  _init() {

  }
}
