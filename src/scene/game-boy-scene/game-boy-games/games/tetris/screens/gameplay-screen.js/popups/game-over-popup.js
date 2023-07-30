import * as PIXI from 'pixi.js';
import { TETRIS_CONFIG } from '../../../data/tetris-config';
import { GAME_BOY_CONFIG } from '../../../../../../game-boy/data/game-boy-config';
import Loader from '../../../../../../../../core/loader';
import Delayed from '../../../../../../../../core/helpers/delayed-call';
import { BUTTON_TYPE } from '../../../../../../game-boy/data/game-boy-data';

export default class GameOverPopup extends PIXI.Container {
  constructor() {
    super();

    this.events = new PIXI.utils.EventEmitter();

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

    this._isGameOverShowed = false;
  }

  _showWall() {
    this._wallContainer.visible = true;

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
    const wallContainer = this._wallContainer = new PIXI.Container();
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
    const gameOverContainer = this._gameOverContainer = new PIXI.Container();
    this.addChild(gameOverContainer);

    this._initGameOverFrame();
    this._initTryAgainText();

    gameOverContainer.cacheAsBitmap = true;
    gameOverContainer.visible = false;
  }

  _initGameOverFrame() {
    const texture = Loader.assets['ui_assets/tetris/game-over-frame'];

    const gameOverFrame = new PIXI.Sprite(texture);
    this._gameOverContainer.addChild(gameOverFrame);

    gameOverFrame.tint = GAME_BOY_CONFIG.screen.tint;
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
    const text = new PIXI.Text(string, new PIXI.TextStyle({
      fontFamily: 'tetris',
      fontSize: 8,
      fill: GAME_BOY_CONFIG.screen.blackColor,
    }));

    text.anchor.set(0.5, 0);

    return text;
  }

  _createBlockLine() {
    const blockLineContainer = new PIXI.Container();
    this.addChild(blockLineContainer);

    const texture = Loader.assets['ui_assets/tetris/game-over-block'];

    for (let i = 0; i < TETRIS_CONFIG.field.width; i++) {
      const block = new PIXI.Sprite(texture);
      blockLineContainer.addChild(block);

      block.tint = GAME_BOY_CONFIG.screen.tint;
      block.x = i * TETRIS_CONFIG.blockSize;
    }

    blockLineContainer.cacheAsBitmap = true;

    return blockLineContainer;
  }
}
