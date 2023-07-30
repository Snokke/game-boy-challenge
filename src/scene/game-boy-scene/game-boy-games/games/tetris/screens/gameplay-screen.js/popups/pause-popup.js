import * as PIXI from 'pixi.js';
import { GAME_BOY_CONFIG } from '../../../../../../game-boy/data/game-boy-config';
import { TETRIS_CONFIG } from '../../../data/tetris-config';

export default class PausePopup extends PIXI.Container {
  constructor() {
    super();

    this._width = TETRIS_CONFIG.field.width * TETRIS_CONFIG.blockSize;
    this._height = TETRIS_CONFIG.field.height * TETRIS_CONFIG.blockSize;

    this._init();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  reset() {
    this.visible = false;
  }

  _init() {
    this._createTextLine('PAUSE', 32);
    this._createTextLine('PRESS', 80);
    this._createTextLine('START TO', 92);
    this._createTextLine('CONTINUE', 104);

    this.cacheAsBitmap = true;

    this.visible = false;
  }

  _createTextLine(string, y) {
    const text = new PIXI.Text(string, new PIXI.TextStyle({
      fontFamily: 'tetris',
      fontSize: 8,
      fill: GAME_BOY_CONFIG.screen.blackColor,
    }));

    this.addChild(text);
    text.anchor.set(0.5, 0);

    text.x = this._width * 0.5;
    text.y = y;
  }
}
