import { Container, Text } from 'pixi.js';
import { TETRIS_CONFIG } from '../../../data/tetris-config';
import GameBoyAudio from '../../../../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../../../../game-boy/game-boy-audio/game-boy-audio-data';

export default class PausePopup extends Container {
  constructor() {
    super();

    this._width = TETRIS_CONFIG.field.width * TETRIS_CONFIG.blockSize;
    this._height = TETRIS_CONFIG.field.height * TETRIS_CONFIG.blockSize;

    this._init();
  }

  show() {
    this.visible = true;
    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.TetrisPause);
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

    this.cacheAsTexture = true;

    this.visible = false;
  }

  _createTextLine(string, y) {
    const text = new Text({
        text: string,
        style: {
            fontFamily: 'tetris',
            fontSize: 8,
            fill: 0x000000,
        },
    });

    this.addChild(text);
    text.anchor.set(0.5, 0);

    text.x = this._width * 0.5;
    text.y = y;
  }
}
