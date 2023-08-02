import * as PIXI from 'pixi.js';
import GameScreenAbstract from '../../../shared/game-screen-abstract';
import { TETRIS_SCREEN_TYPE } from '../../data/tetris-data';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import Field from './field/field';
import NextShape from './next-shape';
import GameOverPopup from './popups/game-over-popup';
import PausePopup from './popups/pause-popup';
import { BUTTON_TYPE } from '../../../../../game-boy/data/game-boy-data';
import { TETRIS_CONFIG } from '../../data/tetris-config';

export default class GameplayScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._screenType = TETRIS_SCREEN_TYPE.Gameplay;
    this._field = null;
    this._gameOverPopup = null;
    this._pausePopup = null;
    this._linesCount = null;
    this._score = null;

    this._isGameActive = false;
    this._isPaused = false;
    this._gameOver = false;

    this._init();
  }

  update(dt) {
    if (this._isGameActive && !this._isPaused) {
      this._field.update(dt);
    }
  }

  onButtonPress(buttonType) {
    if (this._isGameActive) {
      if (!this._isPaused) {
        this._field.onButtonPress(buttonType);
      }

      if (buttonType === BUTTON_TYPE.Start) {
        this._onPauseClick();
      }
    }

    if (this._gameOver) {
      this._gameOverPopup.onButtonPress(buttonType);
    }
  }

  onButtonUp(buttonType) {
    if (this._isGameActive && !this._isPaused) {
      this._field.onButtonUp(buttonType);
    }
  }

  show() {
    super.show();

    this._startGame();
  }

  stopTweens() {
    this._gameOverPopup.stopTweens();
    this._field.stopTweens();
  }

  reset() {
    this._field.reset();
    this._gameOverPopup.reset();
    this._pausePopup.reset();

    this._isGameActive = false;
    this._isPaused = false;
    this._gameOver = false;

    this._linesCount.text = '0'
    this._score.text = '0';
    this._level.text = TETRIS_CONFIG.startLevel.toString();
  }

  disableFalling() {
    this._field.switchFalling();
  }

  clearBottomLine() {
    this._field.clearBottomLine();
  }

  _onPauseClick() {
    this._isPaused = !this._isPaused;

    if (this._isPaused) {
      this._pausePopup.show();
      this._field.hide();
    } else {
      this._pausePopup.hide();
      this._field.show();
    }
  }

  _startGame() {
    this._field.reset();
    this._gameOver = false;
    this._isGameActive = true;

    this._field.show();
    this._field.startGame();
  }

  _init() {
    this._initBackground();
    this._initField();
    this._initLinesCount();
    this._initLevel();
    this._initScore();
    this._initPopups();
    this._initSignals();
  }

  _initBackground() {
    const texture = Loader.assets['ui_assets/tetris/gameplay-screen'];

    const screen = new PIXI.Sprite(texture);
    this.addChild(screen);
    screen.tint = GAME_BOY_CONFIG.screen.tint;
  }

  _initField() {
    const field = this._field = new Field();
    this.addChild(field);
  }

  _initLinesCount() {
    const linesCount = this._linesCount = new PIXI.Text('0', new PIXI.TextStyle({
      fontFamily: 'tetris',
      fontSize: 8,
      fill: GAME_BOY_CONFIG.screen.blackColor,
    }));

    this.addChild(linesCount);
    linesCount.anchor.set(1, 0);

    linesCount.x = GAME_BOY_CONFIG.screen.width - 15;
    linesCount.y = 78;
  }

  _initLevel() {
    const level = this._level = new PIXI.Text(TETRIS_CONFIG.startLevel, new PIXI.TextStyle({
      fontFamily: 'tetris',
      fontSize: 8,
      fill: GAME_BOY_CONFIG.screen.blackColor,
    }));

    this.addChild(level);
    level.anchor.set(1, 0);

    level.x = GAME_BOY_CONFIG.screen.width - 15;
    level.y = 54;
  }

  _initScore() {
    const score = this._score = new PIXI.Text('0', new PIXI.TextStyle({
      fontFamily: 'tetris',
      fontSize: 8,
      fill: GAME_BOY_CONFIG.screen.blackColor,
    }));

    this.addChild(score);
    score.anchor.set(1, 0);

    score.x = GAME_BOY_CONFIG.screen.width - 7;
    score.y = 22;
  }

  _initPopups() {
    this._initGameOverPopup();
    this._initPausePopup();
  }

  _initGameOverPopup() {
    const gameOverPopup = this._gameOverPopup = new GameOverPopup();
    this.addChild(gameOverPopup);

    gameOverPopup.x = TETRIS_CONFIG.field.position.x;
    gameOverPopup.y = TETRIS_CONFIG.field.position.y;
  }

  _initPausePopup() {
    const pausePopup = this._pausePopup = new PausePopup();
    this.addChild(pausePopup);

    pausePopup.x = TETRIS_CONFIG.field.position.x;
    pausePopup.y = TETRIS_CONFIG.field.position.y;
  }

  _initSignals() {
    this._field.events.on('onChangedNextShape', (shapeType) => this._updateNextShape(shapeType));
    this._field.events.on('onLose', () => this._onLose());
    this._field.events.on('onFilledRowsCountChange', (linesCount) => this._onFilledRowsCountChange(linesCount));
    this._field.events.on('onLevelChanged', (level) => this._onLevelChange(level));
    this._field.events.on('onScoreChange', (score) => this._onScoreChange(score));
    this._gameOverPopup.events.on('onWallShowed', () => this._onWallShowed());
    this._gameOverPopup.events.on('onGameOverPopupClick', () => this._onGameOverPopupClick());
  }

  _updateNextShape(shapeType) {
    if (this._nextShape) {
      this.removeChild(this._nextShape);
    }

    const nextShape = this._nextShape = new NextShape(shapeType);
    this.addChild(nextShape);

    nextShape.x = GAME_BOY_CONFIG.screen.width - 40 + nextShape.getWidth() * 0.5;
    nextShape.y = GAME_BOY_CONFIG.screen.height - 40 + nextShape.getHeight() * 0.5;

    nextShape.show();
  }

  _onLose() {
    this._isGameActive = false;
    this._gameOver = true;

    this._nextShape.hide();
    this._gameOverPopup.show();
  }

  _onFilledRowsCountChange(linesCount) {
    if (linesCount >= 9999) {
      linesCount = 9999;
    }

    this._linesCount.text = linesCount;
  }

  _onScoreChange(score) {
    if (score >= 999999) {
      score = 999999;
    }

    if (score > TETRIS_CONFIG.bestScore) {
      TETRIS_CONFIG.bestScore = score;
      this.events.emit('onBestScoreChange');
    }

    this._score.text = score;
  }

  _onLevelChange(level) {
    this._level.text = level;
  }

  _onWallShowed() {
    this._field.hide();
  }

  _onGameOverPopupClick() {
    this._gameOverPopup.hide();
    this._startGame();
  }
}
