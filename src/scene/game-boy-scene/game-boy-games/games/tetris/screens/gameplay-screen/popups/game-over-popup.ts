import { Container, Sprite, Text, EventEmitter, Spritesheet, Texture } from 'pixi.js';
import { TETRIS_CONFIG } from '../../../data/tetris-config';
import Loader from '../../../../../../../../core/loader';
import { BUTTON_TYPE } from '../../../../../../game-boy/data/game-boy-data';
import GameBoyAudio from '../../../../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../../../../game-boy/game-boy-audio/game-boy-audio-data';
import { Timeout, TimeoutInstance } from '../../../../../../../../core/helpers/timeout';

export default class GameOverPopup extends Container {
  public events: EventEmitter;

  private fieldWidth: number;

  private wallContainer: Container;
  private blockLines: Container[];
  private gameOverContainer: Container;
  private animationTimer: any;
  private lineAnimationTimers: any[];
  private showWallLineDelay: number;
  private isGameOverShowed: boolean;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.fieldWidth = TETRIS_CONFIG.field.width * TETRIS_CONFIG.blockSize;

    this.wallContainer = null;
    this.blockLines = [];
    this.gameOverContainer = null;
    this.animationTimer = null;
    this.lineAnimationTimers = [];
    this.isGameOverShowed = false;
    this.showWallLineDelay = 40;

    this.init();
  }

  public show(): void {
    this.visible = true;
    this.showWall();
  }

  public hide(): void {
    this.visible = false;
    this.wallContainer.visible = false;
    this.gameOverContainer.visible = false;

    this.isGameOverShowed = false;
  }

  public onButtonPress(buttonType: BUTTON_TYPE): void {
    if (this.isGameOverShowed && buttonType === BUTTON_TYPE.Start) {
      this.events.emit('onGameOverPopupClick');
    }
  }

  public stopTweens(): void {
    if (this.animationTimer) {
      this.animationTimer.stop();
    }

    this.lineAnimationTimers.forEach((timer) => {
      if (timer) {
        timer.stop();
      }
    });
  }

  public reset(): void {
    this.visible = false;
    this.wallContainer.visible = false;
    this.gameOverContainer.visible = false;

    for (let i = 0; i < this.blockLines.length; i += 1) {
      this.blockLines[i].visible = false;
    }

    this.isGameOverShowed = false;
  }

  private showWall(): void {
    this.wallContainer.visible = true;

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.TetrisGameOver);
    this.wallShowAnimation();
  }

  private wallShowAnimation(): void {
    let index = 0;

    for (let i = this.blockLines.length - 1; i >= 0; i--) {
      const lineAnimationTimer = Timeout.call(this.showWallLineDelay * index, () => {
        this.blockLines[i].visible = true;
      });

      index += 1;
      this.lineAnimationTimers[i] = lineAnimationTimer;
    }

    this.animationTimer = Timeout.call(this.showWallLineDelay * this.blockLines.length + 100, () => {
      this.events.emit('onWallShowed');
      this.gameOverContainer.visible = true;
      this.wallHideAnimation();

      GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.TetrisGameOverFinal);
    });
  }

  private wallHideAnimation(): void {
    let index = 0;

    for (let i = this.blockLines.length - 1; i >= 0; i--) {
      const lineAnimationTimer: TimeoutInstance = Timeout.call(this.showWallLineDelay * index, () => {
        this.blockLines[i].visible = false;
      });

      index += 1;
      this.lineAnimationTimers[i] = lineAnimationTimer;
    }

    this.animationTimer = Timeout.call(this.showWallLineDelay * this.blockLines.length, () => {
      this.wallContainer.visible = false;
      this.isGameOverShowed = true;
    });
  }

  private init(): void {
    this.initGameOverContainer();
    this.initWall();

    this.visible = false;
  }

  private initWall(): void {
    const wallContainer: Container = this.wallContainer = new Container();
    this.addChild(wallContainer);

    for (let i = 0; i < TETRIS_CONFIG.field.height; i++) {
      const blockLine: Container = this.createBlockLine();
      wallContainer.addChild(blockLine);

      blockLine.y = i * TETRIS_CONFIG.blockSize;

      blockLine.visible = false;
      this.blockLines.push(blockLine);
    }

    wallContainer.visible = false;
  }

  private initGameOverContainer(): void {
    const gameOverContainer: Container = this.gameOverContainer = new Container();
    this.addChild(gameOverContainer);

    this.initGameOverFrame();
    this.initTryAgainText();

    gameOverContainer.cacheAsTexture(true);
    gameOverContainer.visible = false;
  }

  private initGameOverFrame(): void {
    const spriteSheet = Loader.assets['assets/spritesheets/tetris-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['game-over-frame.png'] as Texture;

    const gameOverFrame = new Sprite(texture);
    this.gameOverContainer.addChild(gameOverFrame);

    gameOverFrame.anchor.set(0.5);

    gameOverFrame.x = this.fieldWidth * 0.5;
    gameOverFrame.y = 44;

    const text01 = this.createTextLine('GAME');
    const text02 = this.createTextLine('OVER');

    this.gameOverContainer.addChild(text01, text02);

    text01.x = this.fieldWidth * 0.5 + 1;
    text01.y = 30;

    text02.x = this.fieldWidth * 0.5 + 1;
    text02.y = 46;
  }

  private initTryAgainText(): void {
    const text01 = this.createTextLine('TRY');
    const text02 = this.createTextLine('AGAIN');

    this.gameOverContainer.addChild(text01, text02);

    text01.x = this.fieldWidth * 0.5;
    text01.y = 96;

    text02.x = this.fieldWidth * 0.5;
    text02.y = 108;
  }

  private createTextLine(string: string): Text {
    const text = new Text({
      text: string,
      style: {
        fontFamily: 'tetris',
        fontSize: 8,
        fill: 0x000000,
      },
    });

    text.anchor.set(0.5, 0);

    return text;
  }

  private createBlockLine(): Container {
    const blockLineContainer = new Container();
    this.addChild(blockLineContainer);

    const spriteSheet = Loader.assets['assets/spritesheets/tetris-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['game-over-block.png'] as Texture;

    for (let i = 0; i < TETRIS_CONFIG.field.width; i++) {
      const block = new Sprite(texture);
      blockLineContainer.addChild(block);

      block.x = i * TETRIS_CONFIG.blockSize;
    }

    blockLineContainer.cacheAsTexture(true);

    return blockLineContainer;
  }
}
