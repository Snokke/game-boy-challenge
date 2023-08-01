import GameAbstract from "../game-abstract";
import { SPACE_INVADERS_SCREEN_TYPE } from "./data/space-invaders-data";
import GameOverScreen from "./screens/game-over-screen";
import GameplayScreen from "./screens/gameplay-screen/gameplay-screen";
import TitleScreen from "./screens/title-screen";

export default class SpaceInvaders extends GameAbstract {
  constructor() {
    super();

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
    this._showScreen(SPACE_INVADERS_SCREEN_TYPE.Title);
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

  _initGameOverScreen() {
    const gameOverScreen = new GameOverScreen();
    this.addChild(gameOverScreen);

    this._screens[SPACE_INVADERS_SCREEN_TYPE.GameOver] = gameOverScreen;
  }

  _initSignals() {
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Title].events.on('onStartGame', () => this._onStartGame());
  }

  _onStartGame() {
    this._screens[SPACE_INVADERS_SCREEN_TYPE.Title].hide();
    this._showScreen(SPACE_INVADERS_SCREEN_TYPE.Gameplay);
  }
}
