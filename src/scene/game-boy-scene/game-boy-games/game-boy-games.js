import * as PIXI from 'pixi.js';
import LoadingScreen from './screens/loading-screen';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import NoCartridgeScreen from './screens/no-cartridge-screen';
import DamagedCartridgeScreen from './screens/damaged-cartridge-screen';
import { GAME_TYPE } from './data/games-config';
import { GAMES_CLASSES } from './data/games-classes';

export default class GameBoyGames {
  constructor(application) {

    this._application = application;

    this._container = null;
    this._loadingScreen = null;
    this._noCartridgeScreen = null;
    this._damagedCartridgeScreen = null;
    this._allScreens = [];
    this._games = {};
    this._powerOffTween = null;
    this._isUpdateEnabled = GAME_BOY_CONFIG.powerOn;

    this._gameType = GAME_TYPE.Tetris;

    this._init();
  }

  update(dt) {
    if (!this._isUpdateEnabled) {
      return;
    }

    if (this._gameType !== null && this._games[this._gameType].visible) {
      this._games[this._gameType].update(dt);
    }
  }

  onPowerOn() {
    GAME_BOY_CONFIG.updateTexture = true;
    this._isUpdateEnabled = true;
    this._stopPowerOffTween();

    this._container.alpha = 1;
    this._container.visible = true;

    this._loadingScreen.show();
    // this.startGame(this._gameType);
  }

  onPowerOff() {
    this._isUpdateEnabled = false;

    this._stopPowerOffTween();
    this._allScreens.forEach(screen => screen.stopTweens());

    this._powerOffTween = new TWEEN.Tween(this._container)
      .to({ alpha: 0 }, 1000)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        this._container.visible = false;
        GAME_BOY_CONFIG.updateTexture = false;

        this._games[this._gameType].hide();
        this._games[this._gameType].reset();
      });
  }

  onButtonPress(buttonType) {
    if (!GAME_BOY_CONFIG.powerOn) {
      return;
    }

    if (this._gameType !== null) {
      this._games[this._gameType].onButtonPress(buttonType);
    }
  }

  startGame() {
    this._games[this._gameType].show();
  }

  _stopPowerOffTween() {
    if (this._powerOffTween) {
      this._powerOffTween.stop();
    }
  }

  _init() {
    this._initRootContainer();
    this._initScreens();
    this._initOverlays();
    this._initGames();

    this._initSignals();
  }

  _initRootContainer() {
    const container = this._container = new PIXI.Container();
    this._application.stage.addChild(container);
  }

  _initScreens() {
    this._initLoadingScreen();
    this._initNoCartridgeScreen();
    this._initDamagedCartridgeScreen();

    this._allScreens = [
      this._loadingScreen,
      this._noCartridgeScreen,
      this._damagedCartridgeScreen,
    ];
  }

  _initOverlays() {

  }

  _initGames() {
    const activeGames = [
      GAME_TYPE.Tetris,
      GAME_TYPE.Zelda,
      GAME_TYPE.DuckTales,
    ];

    activeGames.forEach(gameType => {
      const gameClass = GAMES_CLASSES[gameType];

      if (gameClass) {
        const game = new gameClass();
        this._container.addChild(game);

        this._games[gameType] = game;
      } else {
        this._games[gameType] = this._noCartridgeScreen;
      }
    });
  }

  _initLoadingScreen() {
    const loadingScreen = this._loadingScreen = new LoadingScreen();
    this._container.addChild(loadingScreen);
  }

  _initNoCartridgeScreen() {
    const noCartridgeScreen = this._noCartridgeScreen = new NoCartridgeScreen();
    this._container.addChild(noCartridgeScreen);
  }

  _initDamagedCartridgeScreen() {
    const damagedCartridgeScreen = this._damagedCartridgeScreen = new DamagedCartridgeScreen();
    this._container.addChild(damagedCartridgeScreen);
  }

  _initSignals() {
    this._loadingScreen.events.on('onComplete', () => this._onLoadingComplete());
  }

  _onLoadingComplete() {
    if (!GAME_BOY_CONFIG.powerOn) {
      return;
    }

    if (this._gameType === null) {
      this._noCartridgeScreen.start();
    } else {
      this.startGame();
    }
  }
}
