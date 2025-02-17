import LicenseScreen from './screens/license-screen/license-screen';
import TitleScreen from './screens/title-screen/title-screen';
import GameplayScreen from './screens/gameplay-screen/gameplay-screen';
import GameAbstract from '../game-abstract';
import { TETRIS_SCREEN_TYPE } from './data/tetris-data';
import { EventEmitter } from 'pixi.js';
import { TETRIS_CONFIG } from './data/tetris-config';
import { GAME_TYPE } from '../../data/games-config';
import DEBUG_CONFIG from '../../../../../Data/Configs/Main/debug-config';

export default class Tetris extends GameAbstract {
  public events: EventEmitter;

  private screens: { [key: string]: any };
  private currentScreenType: string | null;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.screens = {};
    this.currentScreenType = null;

    this.init();
  }

  public update(dt: number): void {
    this.screens[this.currentScreenType!].update(dt);
  }

  public show(): void {
    super.show();

    this.reset();

    if (DEBUG_CONFIG.startState.loadGame === GAME_TYPE.Tetris && DEBUG_CONFIG.startState.startScreen) {
      this.showScreen(DEBUG_CONFIG.startState.startScreen);
    } else {
      this.showScreen(TETRIS_SCREEN_TYPE.License);
    }
  }

  public hide(): void {
    super.hide();

    this.hideAllScreens();
    this.reset();
  }

  public onButtonPress(buttonType: string): void {
    if (!this.currentScreenType) {
      return;
    }

    this.screens[this.currentScreenType].onButtonPress(buttonType);
  }

  public onButtonUp(buttonType: string): void {
    if (!this.currentScreenType) {
      return;
    }

    this.screens[this.currentScreenType].onButtonUp(buttonType);
  }

  public stopTweens(): void {
    for (let screenType in this.screens) {
      this.screens[screenType].stopTweens();
    }
  }

  public startGameAtLevel(level: number): void {
    TETRIS_CONFIG.startLevel = level;

    this.stopTweens();
    this.hideAllScreens();
    this.reset();

    this.showScreen(TETRIS_SCREEN_TYPE.Gameplay);
  }

  public disableFalling(): void {
    this.screens[TETRIS_SCREEN_TYPE.Gameplay].disableFalling();
  }

  public clearBottomLine(): void {
    this.screens[TETRIS_SCREEN_TYPE.Gameplay].clearBottomLine();
  }

  private reset(): void {
    for (let screenType in this.screens) {
      this.screens[screenType].reset();
    }
  }

  private hideAllScreens(): void {
    for (let screenType in this.screens) {
      this.screens[screenType].hide();
    }
  }

  private showScreen(screenType: string): void {
    this.currentScreenType = screenType;
    this.screens[screenType].show();
  }

  private init(): void {
    this.initScreens();
    this.initSignals();

    this.visible = false;
  }

  private initScreens(): void {
    this.initLicenseScreen();
    this.initTitleScreen();
    this.initGameplayScreen();
  }

  private initLicenseScreen(): void {
    const licenseScreen = new LicenseScreen();
    this.addChild(licenseScreen);

    this.screens[TETRIS_SCREEN_TYPE.License] = licenseScreen;
  }

  private initTitleScreen(): void {
    const titleScreen = new TitleScreen();
    this.addChild(titleScreen);

    this.screens[TETRIS_SCREEN_TYPE.Title] = titleScreen;
  }

  private initGameplayScreen(): void {
    const gameplayScreen = new GameplayScreen();
    this.addChild(gameplayScreen);

    this.screens[TETRIS_SCREEN_TYPE.Gameplay] = gameplayScreen;
  }

  private initSignals(): void {
    this.screens[TETRIS_SCREEN_TYPE.License].events.on('onComplete', () => this.onLicenseScreenComplete());
    this.screens[TETRIS_SCREEN_TYPE.Title].events.on('onStartGame', () => this.onStartGame());
    this.screens[TETRIS_SCREEN_TYPE.Gameplay].events.on('onBestScoreChange', () => this.events.emit('onBestScoreChange'));
  }

  private onLicenseScreenComplete(): void {
    this.screens[TETRIS_SCREEN_TYPE.License].hide();
    this.showScreen(TETRIS_SCREEN_TYPE.Title);
  }

  private onStartGame(): void {
    this.screens[TETRIS_SCREEN_TYPE.Title].hide();
    this.showScreen(TETRIS_SCREEN_TYPE.Gameplay);
  }
}
