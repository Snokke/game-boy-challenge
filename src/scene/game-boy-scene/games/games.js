import * as PIXI from 'pixi.js';
import LoadingScreen from './loading-screen';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';

export default class Games {
  constructor(application) {

    this._application = application;

    this._container = null;
    this._loadingScreen = null;

    this._init();
  }

  update(dt) {
    // if (!GAME_BOY_CONFIG.powerOn) {
    //   return;
    // }

    this._loadingScreen.update(dt);
  }

  onPowerOn() {
    this._loadingScreen.show();
    this._container.alpha = 1;
  }

  onPowerOff() {
    new TWEEN.Tween(this._container)
      .to({ alpha: 0 }, 200)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      // .onComplete(() => {
        // this._loadingScreen.hide();
      // });
  }

  onButtonPress(buttonType) {
    if (!GAME_BOY_CONFIG.powerOn) {
      return;
    }

    console.log('onButtonPress', buttonType);
  }

  _init() {
    this._initRootContainer();
    this._initLoadingScreen();
  }

  _initRootContainer() {
    const container = this._container = new PIXI.Container();
    this._application.stage.addChild(container);
  }

  _initLoadingScreen() {
    const loadingScreen = this._loadingScreen = new LoadingScreen();
    this._container.addChild(loadingScreen);
  }
}
