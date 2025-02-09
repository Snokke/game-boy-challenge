import { EventEmitter } from 'pixi.js';
import { GAME_TYPE } from "../../data/games-config";
import GameAbstract from "../game-abstract";
import { SPACE_INVADERS_CONFIG } from "./data/space-invaders-config";
import { SPACE_INVADERS_SCREEN_TYPE } from "./data/space-invaders-data";
import GameOverScreen from "./screens/game-over-screen";
import GameplayScreen from "./screens/gameplay-screen/gameplay-screen";
import RoundScreen from "./screens/round-screen";
import TitleScreen from "./screens/title-screen";
import DEBUG_CONFIG from '../../../../../Data/Configs/Main/debug-config';

export default class SpaceInvaders extends GameAbstract {
  public events: EventEmitter;

  private screens: { [key in SPACE_INVADERS_SCREEN_TYPE]?: any };
  private currentScreenType: SPACE_INVADERS_SCREEN_TYPE;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.screens = {};
    this.currentScreenType = null;

    this.init();
  }

  public update(dt: number): void {
    this.screens[this.currentScreenType].update(dt);
  }

  public show(): void {
    super.show();

    this.reset();

    if (DEBUG_CONFIG.startState.loadGame === GAME_TYPE.SpaceInvaders && DEBUG_CONFIG.startState.startScreen) {
      this.showScreen(DEBUG_CONFIG.startState.startScreen);
    } else {
      this.showScreen(SPACE_INVADERS_SCREEN_TYPE.Title);
    }
  }

  public hide(): void {
    super.hide();

    for (let screenType in this.screens) {
      this.screens[screenType].hide();
    }

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

  private reset(): void {
    SPACE_INVADERS_CONFIG.currentRound = 1;

    for (let screenType in this.screens) {
      this.screens[screenType].reset();
    }
  }

  private showScreen(screenType: SPACE_INVADERS_SCREEN_TYPE): void {
    this.currentScreenType = screenType;
    this.screens[screenType].show();
  }

  private init(): void {
    this.initScreens();
    this.initSignals();
  }

  private initScreens(): void {
    this.initTitleScreen();
    this.initGameplayScreen();
    this.initRoundScreen();
    this.initGameOverScreen();
  }

  private initTitleScreen(): void {
    const titleScreen = new TitleScreen();
    this.addChild(titleScreen);

    this.screens[SPACE_INVADERS_SCREEN_TYPE.Title] = titleScreen;
  }

  private initGameplayScreen(): void {
    const gameplayScreen = new GameplayScreen();
    this.addChild(gameplayScreen);

    this.screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay] = gameplayScreen;
  }

  private initRoundScreen(): void {
    const roundScreen = new RoundScreen();
    this.addChild(roundScreen);

    this.screens[SPACE_INVADERS_SCREEN_TYPE.Round] = roundScreen;
  }

  private initGameOverScreen(): void {
    const gameOverScreen = new GameOverScreen();
    this.addChild(gameOverScreen);

    this.screens[SPACE_INVADERS_SCREEN_TYPE.GameOver] = gameOverScreen;
  }

  private initSignals(): void {
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Title].events.on('onStartGame', () => this._onStartGame());
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Round].events.on('onRoundEnd', () => this.onRoundEnd());
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].events.on('onGameOver', () => this.onGameOver());
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].events.on('onAllEnemiesKilled', () => this.onNextRound());
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].events.on('onBestScoreChange', () => this.events.emit('onBestScoreChange'));
    this.screens[SPACE_INVADERS_SCREEN_TYPE.GameOver].events.on('onGameOverEnd', () => this.onGameOverScreenEnd());
  }

  private _onStartGame(): void {
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Title].hide();
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Round].updateRound();
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].resetLivesScores();
    this.showScreen(SPACE_INVADERS_SCREEN_TYPE.Round);
  }

  private onRoundEnd(): void {
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Round].hide();
    this.showScreen(SPACE_INVADERS_SCREEN_TYPE.Gameplay);
  }

  private onNextRound(): void {
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].hide();

    SPACE_INVADERS_CONFIG.currentRound++;
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].reset();
    this.screens[SPACE_INVADERS_SCREEN_TYPE.Round].updateRound();

    this.showScreen(SPACE_INVADERS_SCREEN_TYPE.Round);
  }

  private onGameOver(): void {
    SPACE_INVADERS_CONFIG.currentRound = 1;

    this.screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].hide();
    this.showScreen(SPACE_INVADERS_SCREEN_TYPE.GameOver);
  }

  private onGameOverScreenEnd(): void {
    this.screens[SPACE_INVADERS_SCREEN_TYPE.GameOver].hide();
    this.reset();
    this.showScreen(SPACE_INVADERS_SCREEN_TYPE.Title);
  }
}
