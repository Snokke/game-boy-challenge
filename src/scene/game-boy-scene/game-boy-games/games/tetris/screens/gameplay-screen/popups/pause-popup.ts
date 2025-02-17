import { Container, Text } from 'pixi.js';
import { TETRIS_CONFIG } from '../../../data/tetris-config';
import GameBoyAudio from '../../../../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../../../../game-boy/game-boy-audio/game-boy-audio-data';

export default class PausePopup extends Container {
  private popupWidth: number;

  constructor() {
    super();

    this.popupWidth = TETRIS_CONFIG.field.width * TETRIS_CONFIG.blockSize;

    this.init();
  }

  public show(): void {
    this.visible = true;
    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.TetrisPause);
  }

  public hide(): void {
    this.visible = false;
  }

  public reset(): void {
    this.visible = false;
  }

  private init(): void {
    this.createTextLine('PAUSE', 32);
    this.createTextLine('PRESS', 80);
    this.createTextLine('START TO', 92);
    this.createTextLine('CONTINUE', 104);

    this.cacheAsTexture(true);

    this.visible = false;
  }

  private createTextLine(string: string, y: number): void {
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

    text.x = this.popupWidth * 0.5;
    text.y = y;
  }
}
