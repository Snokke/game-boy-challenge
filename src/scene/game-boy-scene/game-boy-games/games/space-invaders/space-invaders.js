import { EventEmitter } from 'pixi.js';
import DEBUG_CONFIG from "../../../../../core/configs/debug-config";
import { GAME_TYPE } from "../../data/games-config";
import GameAbstract from "../game-abstract";
import { SPACE_INVADERS_CONFIG } from "./data/space-invaders-config";
import { SPACE_INVADERS_SCREEN_TYPE } from "./data/space-invaders-data";
import GameOverScreen from "./screens/game-over-screen";
import GameplayScreen from "./screens/gameplay-screen/gameplay-screen";
import RoundScreen from "./screens/round-screen";
import TitleScreen from "./screens/title-screen";

export default class SpaceInvaders extends GameAbstract {
  constructor() {
    super();

    this.events = new EventEmitter();

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

    if (DEBUG_CONFIG.startState.loadGame === GAME_TYPE.SpaceInvaders && DEBUG_CONFIG.startState.startScreen) {
      this._showScreen(DEBUG_CONFIG.startState.startScreen);
    } else {
      this._showScreen(SPACE_INVADERS_SCREEN_TYPE.Title);
    }
  }

  hide() {
    super.hide();

    for (let screenType in this._screens) {
      this._screens[screenType].hide();
    }

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

  _reset() {
    SPACE_INVADERS_CONFIG.currentRound = 1;

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
    this._initSignals();
  }

  _initScreens() {
    this._initTitleScreen();
    this._initGameplayScreen();
    this._initRoundScreen();
    this._initGameOverScreen();
  }

  _initTitleScreen() {
    const titleScreen = new TitleScreen();
    this.addChild(titleScreen);

    this._screens[SPACE_INVADERS_SCREEN_TYPE.Title] = titleScreen;
  }

  _initGameplayScreen() {
    const gameplayScreen = new GameplayScreen();
    this.addChild(gameplayScreen);

    this._screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay] = gameplayScreen;
  }

  _initRoundScreen() {
    const roundScreen = new RoundScreen();
    this.addChild(roundScreen);

    this._screens[SPACE_INVADERS_SCREEN_TYPE.Round] = roundScreen;
  }

  _initGameOverScreen() {
    const gameOverScreen = new GameOverScreen();
    this.addChild(gameOverScreen);

    this._screens[SPACE_INVADERS_SCREEN_TYPE.GameOver] = gameOverScreen;
  }

  _initSignals() {
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Title].events.on('onStartGame', () => this._onStartGame());
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Round].events.on('onRoundEnd', () => this._onRoundEnd());
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].events.on('onGameOver', () => this._onGameOver());
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].events.on('onAllEnemiesKilled', () => this._onNextRound());
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].events.on('onBestScoreChange', () => this.events.emit('onBestScoreChange'));
    this._screens[SPACE_INVADERS_SCREEN_TYPE.GameOver].events.on('onGameOverEnd', () => this._onGameOverScreenEnd());
  }

  _onStartGame() {
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Title].hide();
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Round].updateRound();
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].resetLivesScores();
    this._showScreen(SPACE_INVADERS_SCREEN_TYPE.Round);
  }

  _onRoundEnd() {
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Round].hide();
    this._showScreen(SPACE_INVADERS_SCREEN_TYPE.Gameplay);
  }

  _onNextRound() {
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].hide();

    SPACE_INVADERS_CONFIG.currentRound++;
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].reset();
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Round].updateRound();

    this._showScreen(SPACE_INVADERS_SCREEN_TYPE.Round);
  }

  _onGameOver() {
    SPACE_INVADERS_CONFIG.currentRound = 1;

    this._screens[SPACE_INVADERS_SCREEN_TYPE.Gameplay].hide();
    this._showScreen(SPACE_INVADERS_SCREEN_TYPE.GameOver);
  }

  _onGameOverScreenEnd() {
    this._screens[SPACE_INVADERS_SCREEN_TYPE.GameOver].hide();
    this._reset();
    this._showScreen(SPACE_INVADERS_SCREEN_TYPE.Title);
  }
}
