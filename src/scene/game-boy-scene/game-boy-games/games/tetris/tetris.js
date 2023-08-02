import LicenseScreen from './screens/license-screen/license-screen';
import TitleScreen from './screens/title-screen/title-screen';
import GameplayScreen from './screens/gameplay-screen.js/gameplay-screen';
import GameAbstract from '../game-abstract';
import { TETRIS_SCREEN_TYPE } from './data/tetris-data';
import { MessageDispatcher } from 'black-engine';
import { TETRIS_CONFIG } from './data/tetris-config';

export default class Tetris extends GameAbstract {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._screens = {};
    this._currentScreenType = null;

    this._init();
  }

  update(dt) {
    this._screens[this._currentScreenType].update(dt);
  }

  show() {
    super.show();

    this._reset();
    this._showScreen(TETRIS_SCREEN_TYPE.License);
  }

  hide() {
    super.hide();

    this._hideAllScreens();
    this._reset();
  }

  onButtonPress(buttonType) {
    if (!this._currentScreenType) {
      return;
    }

    this._screens[this._currentScreenType].onButtonPress(buttonType);
  }

  onButtonUp(buttonType) {
    if (!this._currentScreenType) {
      return;
    }

    this._screens[this._currentScreenType].onButtonUp(buttonType);
  }

  stopTweens() {
    for (let screenType in this._screens) {
      this._screens[screenType].stopTweens();
    }
  }

  startGameAtLevel(level) {
    TETRIS_CONFIG.startLevel = level;

    this.stopTweens();
    this._hideAllScreens();
    this._reset();

    this._showScreen(TETRIS_SCREEN_TYPE.Gameplay);
  }

  disableFalling() {
    this._screens[TETRIS_SCREEN_TYPE.Gameplay].disableFalling();
  }

  clearBottomLine() {
    this._screens[TETRIS_SCREEN_TYPE.Gameplay].clearBottomLine();
  }

  _reset() {
    for (let screenType in this._screens) {
      this._screens[screenType].reset();
    }
  }

  _hideAllScreens() {
    for (let screenType in this._screens) {
      this._screens[screenType].hide();
    }
  }

  _showScreen(screenType) {
    this._currentScreenType = screenType;
    this._screens[screenType].show();
  }

  _init() {
    this._initScreens();
    this._initSignals();

    this.visible = false;
  }

  _initScreens() {
    this._initLicenseScreen();
    this._initTitleScreen();
    this._initGameplayScreen();
  }

  _initLicenseScreen() {
    const licenseScreen = new LicenseScreen();
    this.addChild(licenseScreen);

    this._screens[TETRIS_SCREEN_TYPE.License] = licenseScreen;
  }

  _initTitleScreen() {
    const titleScreen = new TitleScreen();
    this.addChild(titleScreen);

    this._screens[TETRIS_SCREEN_TYPE.Title] = titleScreen;
  }

  _initGameplayScreen() {
    const gameplayScreen = new GameplayScreen();
    this.addChild(gameplayScreen);

    this._screens[TETRIS_SCREEN_TYPE.Gameplay] = gameplayScreen;
  }

  _initSignals() {
    this._screens[TETRIS_SCREEN_TYPE.License].events.on('onComplete', () => this._onLicenseScreenComplete());
    this._screens[TETRIS_SCREEN_TYPE.Title].events.on('onStartGame', () => this._onStartGame());
    this._screens[TETRIS_SCREEN_TYPE.Gameplay].events.on('onBestScoreChange', () => this.events.post('onBestScoreChange'));
  }

  _onLicenseScreenComplete() {
    this._screens[TETRIS_SCREEN_TYPE.License].hide();
    this._showScreen(TETRIS_SCREEN_TYPE.Title);
  }

  _onStartGame() {
    this._screens[TETRIS_SCREEN_TYPE.Title].hide();
    this._showScreen(TETRIS_SCREEN_TYPE.Gameplay);
  }
}
