import { Container, ColorMatrixFilter } from 'pixi.js';
import LoadingScreen from './screens/loading-screen';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config';
import TWEEN from 'three/addons/libs/tween.module.js';
import NoCartridgeScreen from './screens/no-cartridge-screen';
import DamagedCartridgeScreen from './screens/damaged-cartridge-screen';
import { GAME_TYPE } from './data/games-config';
import { GAMES_CLASSES } from './data/games-classes';
import VolumeOverlay from './overlay/volume-overlay';
import GameBoyAudio from '../game-boy/game-boy-audio/game-boy-audio';
import { EventEmitter } from 'pixi.js';
import DEBUG_CONFIG from '../../../core/configs/debug-config';

export default class GameBoyGames {
  constructor(application) {

    this.events = new EventEmitter();

    this._application = application;

    this._container = null;
    this._loadingScreen = null;
    this._noCartridgeScreen = null;
    this._damagedCartridgeScreen = null;
    this._volumeOverlay = null;
    this._allScreens = [];
    this._games = {};
    this._powerOffTween = null;
    this._isUpdateEnabled = GAME_BOY_CONFIG.powerOn;

    this._gameType = null;

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

    this._hideAllScreens();
    this._hideAllGames();
    this._stopPowerOffTween();

    this._container.alpha = 1;
    this._container.visible = true;

    if (DEBUG_CONFIG.startState.loadGame) {
      this.setGame(DEBUG_CONFIG.startState.loadGame);
      this.startGame();
    } else {
      this._loadingScreen.show();
    }
  }

  onPowerOff() {
    this._isUpdateEnabled = false;

    this._stopPowerOffTween();
    this._allScreens.forEach(screen => screen.stopTweens());

    if (this._gameType) {
      this._games[this._gameType].stopTweens();
    }

    this._powerOffTween = new TWEEN.Tween(this._container)
      .to({ alpha: 0 }, 500)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        this._container.visible = false;
        GAME_BOY_CONFIG.updateTexture = false;

        if (this._gameType) {
          this._hideCurrentGame();
        }
      });
  }

  onVolumeChanged() {
    if (GAME_BOY_CONFIG.powerOn) {
      this._volumeOverlay.onVolumeChanged();
    }

    const gameBoyVolume = SOUNDS_CONFIG.gameBoyVolume;
    GameBoyAudio.changeGameBoyVolume(gameBoyVolume);
  }

  onButtonPress(buttonType) {
    if (!GAME_BOY_CONFIG.powerOn) {
      return;
    }

    if (this._gameType !== null) {
      this._games[this._gameType].onButtonPress(buttonType);
    }
  }

  onButtonUp(buttonType) {
    if (!GAME_BOY_CONFIG.powerOn) {
      return;
    }

    if (this._gameType !== null) {
      this._games[this._gameType].onButtonUp(buttonType);
    }
  }

  setGame(gameType) {
    this._gameType = gameType;
  }

  setNoGame() {
    this._gameType = null;
  }

  startGame() {
    this._showCurrentGame();
  }

  restartTetris(level) {
    this._games[GAME_TYPE.Tetris].startGameAtLevel(level);
  }

  disableTetrisFalling() {
    this._games[GAME_TYPE.Tetris].disableFalling();
  }

  clearTetrisBottomLine() {
    this._games[GAME_TYPE.Tetris].clearBottomLine();
  }

  _showCurrentGame() {
    this._games[this._gameType].show();
    this.events.emit('gameStarted', this._gameType);
  }

  _hideCurrentGame() {
    this._games[this._gameType].hide();
    this.events.emit('gameStopped', this._gameType);
  }

  _hideAllGames() {
    for (const gameType in this._games) {
      this._games[gameType].hide();
    }
  }

  _hideAllScreens() {
    this._allScreens.forEach(screen => screen.hide());
  }

  _stopPowerOffTween() {
    if (this._powerOffTween) {
      this._powerOffTween.stop();
    }
  }

  _init() {
    this._initRootContainer();
    this._initScreens();
    this._initGames();
    this._initOverlays();
    this._addColorMatrixFilter();

    this._initSignals();

    this._container.scale.set(GAME_BOY_CONFIG.screen.scale);
  }

  _initRootContainer() {
    const container = this._container = new Container();
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
    this._initVolumeOverlay();
  }

  _addColorMatrixFilter() {
    const brightness = 0.2;

    const tint = 0x646e3c;
    const r = tint >> 16 & 0xFF;
    const g = tint >> 8 & 0xFF;
    const b = tint & 0xFF;

    const colorMatrix = [
      r / 255, 0, 0, 0, brightness,
      0, g / 255, 0, 0, brightness,
      0, 0, b / 255, 0, brightness,
      0, 0, 0, 1, 0
    ];

    const filter = new ColorMatrixFilter();
    filter.matrix = colorMatrix;
    this._container.filters = [filter];
  }

  _initVolumeOverlay() {
    const volumeOverlay = this._volumeOverlay = new VolumeOverlay();
    this._container.addChild(volumeOverlay);

    volumeOverlay.x = GAME_BOY_CONFIG.screen.width * 0.5;
    volumeOverlay.y = GAME_BOY_CONFIG.screen.height - 15;
  }

  _initGames() {
    const activeGames = [
      GAME_TYPE.Tetris,
      GAME_TYPE.Zelda,
      GAME_TYPE.SpaceInvaders,
    ];

    activeGames.forEach(gameType => {
      const gameClass = GAMES_CLASSES[gameType];

      if (gameClass) {
        const game = new gameClass();
        this._container.addChild(game);

        this._games[gameType] = game;
      } else {
        this._games[gameType] = this._damagedCartridgeScreen;
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
    this._games[GAME_TYPE.Tetris].events.on('onBestScoreChange', () => this.events.emit('onTetrisBestScoreChange'));
    this._games[GAME_TYPE.SpaceInvaders].events.on('onBestScoreChange', () => this.events.emit('onSpaceInvadersBestScoreChange'));
  }

  _onLoadingComplete() {
    if (!GAME_BOY_CONFIG.powerOn) {
      return;
    }

    if (this._gameType === null) {
      this._noCartridgeScreen.show();
    } else {
      this.startGame();
    }
  }
}
