import { Container, Sprite, Text, EventEmitter } from 'pixi.js';
import { TETRIS_CONFIG } from '../../../data/tetris-config';
import Loader from '../../../../../../../../core/loader';
import Delayed from '../../../../../../../../core/helpers/delayed-call';
import { BUTTON_TYPE } from '../../../../../../game-boy/data/game-boy-data';
import GameBoyAudio from '../../../../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../../../../game-boy/game-boy-audio/game-boy-audio-data';

export default class GameOverPopup extends Container {
  constructor() {
    super();

    this.events = new EventEmitter();

    this._width = TETRIS_CONFIG.field.width * TETRIS_CONFIG.blockSize;
    this._height = TETRIS_CONFIG.field.height * TETRIS_CONFIG.blockSize;

    this._wallContainer = null;
    this._blockLines = [];
    this._gameOverContainer = null;
    this._animationTimer = null;
    this._lineAnimationTimers = [];

    this._isGameOverShowed = false;

    this._showWallLineDelay = 40;

    this._init();
  }

  show() {
    this.visible = true;
    this._showWall();
  }

  hide() {
    this.visible = false;
    this._wallContainer.visible = false;
    this._gameOverContainer.visible = false;

    this._isGameOverShowed = false;
  }

  onButtonPress(buttonType) {
    if (this._isGameOverShowed && buttonType === BUTTON_TYPE.Start) {
      this.events.emit('onGameOverPopupClick');
    }
  }

  stopTweens() {
    if (this._animationTimer) {
      this._animationTimer.stop();
    }

    this._lineAnimationTimers.forEach((timer) => {
      if (timer) {
        timer.stop();
      }
    });
  }

  reset() {
    this.visible = false;
    this._wallContainer.visible = false;
    this._gameOverContainer.visible = false;

    for (let i = 0; i < this._blockLines.length; i += 1) {
      this._blockLines[i].visible = false;
    }

    this._isGameOverShowed = false;
  }

  _showWall() {
    this._wallContainer.visible = true;

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.TetrisGameOver);
    this._wallShowAnimation();
  }

  _wallShowAnimation() {
    let index = 0;

    for (let i = this._blockLines.length - 1; i >= 0; i--) {
      const lineAnimationTimer = Delayed.call(this._showWallLineDelay * index, () => {
        this._blockLines[i].visible = true;
      });

      index += 1;
      this._lineAnimationTimers[i] = lineAnimationTimer;
    }

    this._animationTimer = Delayed.call(this._showWallLineDelay * this._blockLines.length + 100, () => {
      this.events.emit('onWallShowed');
      this._gameOverContainer.visible = true;
      this._wallHideAnimation();

      GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.TetrisGameOverFinal);
    });
  }

  _wallHideAnimation() {
    let index = 0;

    for (let i = this._blockLines.length - 1; i >= 0; i--) {
      const lineAnimationTimer = Delayed.call(this._showWallLineDelay * index, () => {
        this._blockLines[i].visible = false;
      });

      index += 1;
      this._lineAnimationTimers[i] = lineAnimationTimer;
    }

    this._animationTimer = Delayed.call(this._showWallLineDelay * this._blockLines.length, () => {
      this._wallContainer.visible = false;
      this._isGameOverShowed = true;
    });
  }

  _init() {
    this._initGameOverContainer();
    this._initWall();

    this.visible = false;
  }

  _initWall() {
    const wallContainer = this._wallContainer = new Container();
    this.addChild(wallContainer);

    for (let i = 0; i < TETRIS_CONFIG.field.height; i++) {
      const blockLine = this._createBlockLine();
      wallContainer.addChild(blockLine);

      blockLine.y = i * TETRIS_CONFIG.blockSize;

      blockLine.visible = false;
      this._blockLines.push(blockLine);
    }

    wallContainer.visible = false;
  }

  _initGameOverContainer() {
    const gameOverContainer = this._gameOverContainer = new Container();
    this.addChild(gameOverContainer);

    this._initGameOverFrame();
    this._initTryAgainText();

    gameOverContainer.cacheAsTexture = true;
    gameOverContainer.visible = false;
  }

  _initGameOverFrame() {
    const spriteSheet = Loader.assets['assets/spritesheets/tetris-sheet'];
    const texture = spriteSheet.textures['game-over-frame.png'];

    const gameOverFrame = new Sprite(texture);
    this._gameOverContainer.addChild(gameOverFrame);

    gameOverFrame.anchor.set(0.5);

    gameOverFrame.x = this._width * 0.5;
    gameOverFrame.y = 44;

    const text01 = this._createTextLine('GAME');
    const text02 = this._createTextLine('OVER');

    this._gameOverContainer.addChild(text01, text02);

    text01.x = this._width * 0.5 + 1;
    text01.y = 30;

    text02.x = this._width * 0.5 + 1;
    text02.y = 46;
  }

  _initTryAgainText() {
    const text01 = this._createTextLine('TRY');
    const text02 = this._createTextLine('AGAIN');

    this._gameOverContainer.addChild(text01, text02);

    text01.x = this._width * 0.5;
    text01.y = 96;

    text02.x = this._width * 0.5;
    text02.y = 108;
  }

  _createTextLine(string) {
    const text = new Text({
        text: string,
        style: {
            fontFamily: 'tetris',
            fontSize: 8,
            fill: 0x000000,
        }
    });

    text.anchor.set(0.5, 0);

    return text;
  }

  _createBlockLine() {
    const blockLineContainer = new Container();
    this.addChild(blockLineContainer);

    const spriteSheet = Loader.assets['assets/spritesheets/tetris-sheet'];
    const texture = spriteSheet.textures['game-over-block.png'];

    for (let i = 0; i < TETRIS_CONFIG.field.width; i++) {
      const block = new Sprite(texture);
      blockLineContainer.addChild(block);

      block.x = i * TETRIS_CONFIG.blockSize;
    }

    blockLineContainer.cacheAsTexture = true;

    return blockLineContainer;
  }
}
