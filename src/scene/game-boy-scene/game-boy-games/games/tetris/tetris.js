import * as PIXI from 'pixi.js';
import LicenseScreen from './screens/license-screen';
import TitleScreen from './screens/title-screen';
import GameplayScreen from './screens/gameplay-screen.js/gameplay-screen';
import GameAbstract from '../game-abstract';

export default class Tetris extends GameAbstract {
  constructor() {
    super();

    this._licenseScreen = null;
    this._titleScreen = null;
    this._gameplayScreen = null;

    this._init();
  }

  update(dt) {

  }

  show() {
    super.show();
  }

  hide() {
    super.hide();
    this._reset();
  }

  onButtonPress(buttonType) {

  }

  _reset() {

  }

  _init() {
    this._initScreens();

    this.visible = false;
  }

  _initScreens() {
    this._initLicenseScreen();
    this._initTitleScreen();
    this._initGameplayScreen();
  }

  _initLicenseScreen() {
    const licenseScreen = this._licenseScreen = new LicenseScreen();
    this.addChild(licenseScreen);
  }

  _initTitleScreen() {
    const titleScreen = this._titleScreen = new TitleScreen();
    this.addChild(titleScreen);
  }

  _initGameplayScreen() {
    const gameplayScreen = this._gameplayScreen = new GameplayScreen();
    this.addChild(gameplayScreen);
  }
}
