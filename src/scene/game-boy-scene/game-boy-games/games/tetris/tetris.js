import LicenseScreen from './screens/license-screen/license-screen';
import TitleScreen from './screens/title-screen/title-screen';
import GameplayScreen from './screens/gameplay-screen.js/gameplay-screen';
import GameAbstract from '../game-abstract';
import { SCREEN_TYPE } from './data/tetris-data';
import VolumeController from './overlays/volume-controller';
import { GAME_BOY_CONFIG } from '../../../game-boy/data/game-boy-config';

export default class Tetris extends GameAbstract {
  constructor() {
    super();

    this._screens = {};
    this._volumeController = null;
    this._currentScreenType = null;

    this._init();
  }

  update(dt) {
    this._screens[this._currentScreenType].update(dt);
  }

  show() {
    super.show();

    this._showScreen(SCREEN_TYPE.Gameplay);
    // this._showScreen(SCREEN_TYPE.License);
    // this._showScreen(SCREEN_TYPE.Title);
  }

  hide() {
    super.hide();

    for (let screenType in this._screens) {
      this._screens[screenType].hide();
    }

    this._reset();
  }

  onButtonPress(buttonType) {
    this._screens[this._currentScreenType].onButtonPress(buttonType);
  }

  stopTweens() {
    for (let screenType in this._screens) {
      this._screens[screenType].stopTweens();
    }
  }

  _reset() {
    for (let screenType in this._screens) {
      this._screens[screenType].reset();
    }
  }

  _showScreen(screenType) {
    this._currentScreenType = screenType;
    this._screens[screenType].show();
  }

  _init() {
    this._initScreens();
    this._initOverlays();
    this._initSignals();

    this.visible = false;
  }

  _initScreens() {
    this._initLicenseScreen();
    this._initTitleScreen();
    this._initGameplayScreen();
  }

  _initOverlays() {
    this._initVolumeController();
  }

  _initLicenseScreen() {
    const licenseScreen = new LicenseScreen();
    this.addChild(licenseScreen);

    this._screens[SCREEN_TYPE.License] = licenseScreen;
  }

  _initTitleScreen() {
    const titleScreen = new TitleScreen();
    this.addChild(titleScreen);

    this._screens[SCREEN_TYPE.Title] = titleScreen;
  }

  _initGameplayScreen() {
    const gameplayScreen = new GameplayScreen();
    this.addChild(gameplayScreen);

    this._screens[SCREEN_TYPE.Gameplay] = gameplayScreen;
  }

  _initVolumeController() {
    const volumeController = this._volumeController = new VolumeController();
    this.addChild(volumeController);

    volumeController.x = GAME_BOY_CONFIG.screen.width * 0.5;
    volumeController.y = GAME_BOY_CONFIG.screen.height - 15;
  }

  _initSignals() {
    this._screens[SCREEN_TYPE.License].events.on('onComplete', () => this._onLicenseScreenComplete());
    this._screens[SCREEN_TYPE.Title].events.on('onStartGame', () => this._onStartGame());
  }

  _onLicenseScreenComplete() {
    this._screens[SCREEN_TYPE.License].hide();
    this._showScreen(SCREEN_TYPE.Title);
  }

  _onStartGame() {
    this._screens[SCREEN_TYPE.Title].hide();
    this._showScreen(SCREEN_TYPE.Gameplay);
  }

  _getScreenByType(screenType) {
    for (let screenType in this._screens) {
      const type = this._screens[screenType].getScreenType();

      if (type === screenType) {
        return this._screens[screenType];
      }
    }

    return null;
  }
}
