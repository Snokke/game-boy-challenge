import { Container, Application } from 'pixi.js';
import LoadingScreen from './screens/loading-screen.ts';
import { GAME_BOY_CONFIG } from '../game-boy/data/game-boy-config.ts';
import TWEEN from 'three/addons/libs/tween.module.js';
import NoCartridgeScreen from './screens/no-cartridge-screen.ts';
import DamagedCartridgeScreen from './screens/damaged-cartridge-screen.ts';
import { GAME_TYPE } from './data/games-config.ts';
import { GAMES_CLASSES } from './data/games-classes.ts';
import VolumeOverlay from './overlay/volume-overlay.ts';
import GameBoyAudio from '../game-boy/game-boy-audio/game-boy-audio.ts';
import { EventEmitter } from 'pixi.js';
import DEBUG_CONFIG from '../../../Data/Configs/Main/debug-config.ts';
import { SOUNDS_CONFIG } from '../../../Data/Configs/Main/sounds-config.ts';

export default class GameBoyGames {
  public events: EventEmitter;

  private application: Application;
  private container: Container;
  private loadingScreen: LoadingScreen;
  private noCartridgeScreen: NoCartridgeScreen;
  private damagedCartridgeScreen: DamagedCartridgeScreen;
  private volumeOverlay: VolumeOverlay;
  private allScreens: any[];
  private games: any;
  private powerOffTween: any;
  private isUpdateEnabled: boolean;
  private gameType: string;

  constructor(application: Application) {

    this.events = new EventEmitter();

    this.application = application;

    this.container = null;
    this.loadingScreen = null;
    this.noCartridgeScreen = null;
    this.damagedCartridgeScreen = null;
    this.volumeOverlay = null;
    this.allScreens = [];
    this.games = {};
    this.powerOffTween = null;
    this.isUpdateEnabled = GAME_BOY_CONFIG.powerOn;

    this.gameType = null;

    this.init();
  }

  public update(dt: number): void {
    if (!this.isUpdateEnabled) {
      return;
    }

    if (this.gameType !== null && this.games[this.gameType].visible) {
      this.games[this.gameType].update(dt);
    }
  }

  public onPowerOn(): void {
    GAME_BOY_CONFIG.updateTexture = true;
    this.isUpdateEnabled = true;

    this.hideAllScreens();
    this.hideAllGames();
    this.stopPowerOffTween();

    this.container.alpha = 1;
    this.container.visible = true;

    if (DEBUG_CONFIG.startState.loadGame) {
      this.setGame(DEBUG_CONFIG.startState.loadGame);
      this.startGame();
    } else {
      this.loadingScreen.show();
    }
  }

  public onPowerOff(): void {
    this.isUpdateEnabled = false;

    this.stopPowerOffTween();
    this.allScreens.forEach((screen: any) => screen.stopTweens());

    if (this.gameType) {
      this.games[this.gameType].stopTweens();
    }

    this.powerOffTween = new TWEEN.Tween(this.container)
      .to({ alpha: 0 }, 500)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        this.container.visible = false;
        GAME_BOY_CONFIG.updateTexture = false;

        if (this.gameType) {
          this.hideCurrentGame();
        }
      });
  }

  public onVolumeChanged(): void {
    if (GAME_BOY_CONFIG.powerOn) {
      this.volumeOverlay.onVolumeChanged();
    }

    const gameBoyVolume = SOUNDS_CONFIG.gameBoyVolume;
    GameBoyAudio.changeGameBoyVolume(gameBoyVolume);
  }

  public onButtonPress(buttonType: string): void {
    if (!GAME_BOY_CONFIG.powerOn) {
      return;
    }

    if (this.gameType !== null) {
      this.games[this.gameType].onButtonPress(buttonType);
    }
  }

  public onButtonUp(buttonType: string): void {
    if (!GAME_BOY_CONFIG.powerOn) {
      return;
    }

    if (this.gameType !== null) {
      this.games[this.gameType].onButtonUp(buttonType);
    }
  }

  public setGame(gameType: string): void {
    this.gameType = gameType;
  }

  public setNoGame(): void {
    this.gameType = null;
  }

  public startGame(): void {
    this.showCurrentGame();
  }

  public restartTetris(level: number): void {
    this.games[GAME_TYPE.Tetris].startGameAtLevel(level);
  }

  public disableTetrisFalling(): void {
    this.games[GAME_TYPE.Tetris].disableFalling();
  }

  public clearTetrisBottomLine(): void {
    this.games[GAME_TYPE.Tetris].clearBottomLine();
  }

  private showCurrentGame(): void {
    this.games[this.gameType].show();
    this.events.emit('gameStarted', this.gameType);
  }

  private hideCurrentGame(): void {
    this.games[this.gameType].hide();
    this.events.emit('gameStopped', this.gameType);
  }

  private hideAllGames(): void {
    for (const gameType in this.games) {
      this.games[gameType].hide();
    }
  }

  private hideAllScreens(): void {
    this.allScreens.forEach((screen: any) => screen.hide());
  }

  private stopPowerOffTween(): void {
    if (this.powerOffTween) {
      this.powerOffTween.stop();
    }
  }

  private init(): void {
    this.initRootContainer();
    this.initScreens();
    this.initGames();
    this.initOverlays();
    this.addColorMatrixFilter();

    this.initSignals();

    this.container.scale.set(GAME_BOY_CONFIG.screen.scale);
  }

  private initRootContainer(): void {
    const container: Container = this.container = new Container();
    this.application.stage.addChild(container);
  }

  private initScreens(): void {
    this.initLoadingScreen();
    this.initNoCartridgeScreen();
    this.initDamagedCartridgeScreen();

    this.allScreens = [
      this.loadingScreen,
      this.noCartridgeScreen,
      this.damagedCartridgeScreen,
    ];
  }

  private initOverlays(): void {
    this.initVolumeOverlay();
  }

  private addColorMatrixFilter(): void {
    // const brightness = 0.2;

    // const tint = 0x646e3c;
    // const r = tint >> 16 & 0xFF;
    // const g = tint >> 8 & 0xFF;
    // const b = tint & 0xFF;

    // const colorMatrix = [
    //   r / 255, 0, 0, 0, brightness,
    //   0, g / 255, 0, 0, brightness,
    //   0, 0, b / 255, 0, brightness,
    //   0, 0, 0, 1, 0
    // ];

    // const filter = new ColorMatrixFilter();
    // (<any>filter).matrix = colorMatrix;
    // this.container.filters = [filter];
  }

  private initVolumeOverlay(): void {
    const volumeOverlay = this.volumeOverlay = new VolumeOverlay();
    this.container.addChild(volumeOverlay);

    volumeOverlay.x = GAME_BOY_CONFIG.screen.width * 0.5;
    volumeOverlay.y = GAME_BOY_CONFIG.screen.height - 15;
  }

  private initGames(): void {
    const activeGames: string[] = [
      GAME_TYPE.Tetris,
      GAME_TYPE.Zelda,
      GAME_TYPE.SpaceInvaders,
    ];

    activeGames.forEach((gameType: string) => {
      const gameClass = GAMES_CLASSES[gameType];

      if (gameClass) {
        const game = new gameClass();
        this.container.addChild(game);

        this.games[gameType] = game;
      } else {
        this.games[gameType] = this.damagedCartridgeScreen;
      }
    });
  }

  private initLoadingScreen(): void {
    const loadingScreen = this.loadingScreen = new LoadingScreen();
    this.container.addChild(loadingScreen);
  }

  private initNoCartridgeScreen(): void {
    const noCartridgeScreen = this.noCartridgeScreen = new NoCartridgeScreen();
    this.container.addChild(noCartridgeScreen);
  }

  private initDamagedCartridgeScreen(): void {
    const damagedCartridgeScreen = this.damagedCartridgeScreen = new DamagedCartridgeScreen();
    this.container.addChild(damagedCartridgeScreen);
  }

  private initSignals(): void {
    this.loadingScreen.events.on('onComplete', () => this._onLoadingComplete());
    this.games[GAME_TYPE.Tetris].events.on('onBestScoreChange', () => this.events.emit('onTetrisBestScoreChange'));
    this.games[GAME_TYPE.SpaceInvaders].events.on('onBestScoreChange', () => this.events.emit('onSpaceInvadersBestScoreChange'));
  }

  private _onLoadingComplete(): void {
    if (!GAME_BOY_CONFIG.powerOn) {
      return;
    }

    if (this.gameType === null) {
      this.noCartridgeScreen.show();
    } else {
      this.startGame();
    }
  }
}
