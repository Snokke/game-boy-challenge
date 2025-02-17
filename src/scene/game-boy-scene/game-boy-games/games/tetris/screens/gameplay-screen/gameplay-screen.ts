import GameScreenAbstract from '../../../shared/game-screen-abstract';
import { TETRIS_SCREEN_TYPE } from '../../data/tetris-data';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import Field from './field/field';
import NextShape from './next-shape';
import GameOverPopup from './popups/game-over-popup';
import PausePopup from './popups/pause-popup';
import { BUTTON_TYPE } from '../../../../../game-boy/data/game-boy-data';
import { TETRIS_CONFIG } from '../../data/tetris-config';
import GameBoyAudio from '../../../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../../../game-boy/game-boy-audio/game-boy-audio-data';
import { Text, Sprite, Spritesheet, Texture } from 'pixi.js';

export default class GameplayScreen extends GameScreenAbstract {
  protected screenType: TETRIS_SCREEN_TYPE.Gameplay = TETRIS_SCREEN_TYPE.Gameplay;
  private field: Field;
  private gameOverPopup: GameOverPopup;
  private pausePopup: PausePopup;
  private linesCount: Text;
  private score: Text;
  private level: Text;
  private isGameActive: boolean;
  private isPaused: boolean;
  private gameOver: boolean;
  private nextShape: NextShape;

  constructor() {
    super();

    this.isGameActive = false;
    this.isPaused = false;
    this.gameOver = false;

    this.init();
  }

  public update(dt: number): void {
    if (this.isGameActive && !this.isPaused) {
      this.field.update(dt);
    }
  }

  public onButtonPress(buttonType: BUTTON_TYPE): void {
    if (this.isGameActive) {
      if (!this.isPaused) {
        this.field.onButtonPress(buttonType);
      }

      if (buttonType === BUTTON_TYPE.Start) {
        this.onPauseClick();
      }
    }

    if (buttonType === BUTTON_TYPE.Select) {
      GameBoyAudio.switchSound(GAME_BOY_SOUND_TYPE.TetrisMusic);
      TETRIS_CONFIG.isMusicAllowed = !TETRIS_CONFIG.isMusicAllowed;
    }

    if (this.gameOver) {
      this.gameOverPopup.onButtonPress(buttonType);
    }
  }

  public onButtonUp(buttonType: BUTTON_TYPE): void {
    if (this.isGameActive && !this.isPaused) {
      this.field.onButtonUp(buttonType);
    }
  }

  public show(): void {
    super.show();

    this.startGame();
  }

  public stopTweens(): void {
    this.gameOverPopup.stopTweens();
    this.field.stopTweens();
  }

  public reset(): void {
    this.field.reset();
    this.gameOverPopup.reset();
    this.pausePopup.reset();

    this.isGameActive = false;
    this.isPaused = false;
    this.gameOver = false;

    this.linesCount.text = '0';
    this.score.text = '0';
    this.level.text = TETRIS_CONFIG.startLevel.toString();
  }

  public disableFalling(): void {
    this.field.switchFalling();
  }

  public clearBottomLine(): void {
    this.field.clearBottomLine();
  }

  private onPauseClick(): void {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.pausePopup.show();
      this.field.hide();
    } else {
      this.pausePopup.hide();
      this.field.show();
    }
  }

  private startGame(): void {
    this.field.reset();
    this.gameOver = false;
    this.isGameActive = true;

    this.field.show();
    this.field.startGame();
  }

  private init(): void {
    this.initBackground();
    this.initField();
    this.initLinesCount();
    this.initLevel();
    this.initScore();
    this.initPopups();
    this.initSignals();
  }

  private initBackground(): void {
    const spriteSheet: Spritesheet = Loader.assets['assets/spritesheets/tetris-sheet'] as Spritesheet;
    const texture: Texture = spriteSheet.textures['gameplay-screen.png'] as Texture;

    const screen: Sprite = new Sprite(texture);
    this.addChild(screen);
  }

  private initField(): void {
    const field: Field = this.field = new Field();
    this.addChild(field);
  }

  private initLinesCount(): void {
    const linesCount: Text = this.linesCount = new Text({
        text: '0',
        style: {
            fontFamily: 'tetris',
            fontSize: 8,
            fill: 0x000000,
        }
    });

    this.addChild(linesCount);
    linesCount.anchor.set(1, 0);

    linesCount.x = GAME_BOY_CONFIG.screen.width - 15;
    linesCount.y = 78;
  }

  private initLevel(): void {
    const level: Text = this.level = new Text({
        text: TETRIS_CONFIG.startLevel.toString(),
        style: {
            fontFamily: 'tetris',
            fontSize: 8,
            fill: 0x000000,
        }
    });

    this.addChild(level);
    level.anchor.set(1, 0);

    level.x = GAME_BOY_CONFIG.screen.width - 15;
    level.y = 54;
  }

  private initScore(): void {
    const score: Text = this.score = new Text({
        text: '0',
        style: {
            fontFamily: 'tetris',
            fontSize: 8,
            fill: 0x000000,
        }
    });

    this.addChild(score);
    score.anchor.set(1, 0);

    score.x = GAME_BOY_CONFIG.screen.width - 7;
    score.y = 22;
  }

  private initPopups(): void {
    this.initGameOverPopup();
    this.initPausePopup();
  }

  private initGameOverPopup(): void {
    const gameOverPopup: GameOverPopup = this.gameOverPopup = new GameOverPopup();
    this.addChild(gameOverPopup);

    gameOverPopup.x = TETRIS_CONFIG.field.position.x;
    gameOverPopup.y = TETRIS_CONFIG.field.position.y + 16;
  }

  private initPausePopup(): void {
    const pausePopup: PausePopup = this.pausePopup = new PausePopup();
    this.addChild(pausePopup);

    pausePopup.x = TETRIS_CONFIG.field.position.x;
    pausePopup.y = TETRIS_CONFIG.field.position.y + 16;
  }

  private initSignals(): void {
    this.field.events.on('onChangedNextShape', (shapeType: string) => this.updateNextShape(shapeType));
    this.field.events.on('onLose', () => this.onLose());
    this.field.events.on('onFilledRowsCountChange', (linesCount: number) => this.onFilledRowsCountChange(linesCount));
    this.field.events.on('onLevelChanged', (level: number) => this.onLevelChange(level));
    this.field.events.on('onScoreChange', (score: number) => this.onScoreChange(score));
    this.gameOverPopup.events.on('onWallShowed', () => this.onWallShowed());
    this.gameOverPopup.events.on('onGameOverPopupClick', () => this.onGameOverPopupClick());
  }

  private updateNextShape(shapeType: string): void {
    if (this.nextShape) {
      this.removeChild(this.nextShape);
    }

    const nextShape = this.nextShape = new NextShape(shapeType);
    this.addChild(nextShape);

    nextShape.x = GAME_BOY_CONFIG.screen.width - 40 + nextShape.getWidth() * 0.5;
    nextShape.y = GAME_BOY_CONFIG.screen.height - 40 + nextShape.getHeight() * 0.5;

    nextShape.show();
  }

  private onLose(): void {
    GameBoyAudio.stopSound(GAME_BOY_SOUND_TYPE.TetrisMusic);
    this.isGameActive = false;
    this.gameOver = true;

    this.nextShape.hide();
    this.gameOverPopup.show();
  }

  private onFilledRowsCountChange(linesCount: number): void {
    if (linesCount >= 9999) {
      linesCount = 9999;
    }

    this.linesCount.text = linesCount.toString();
  }

  private onScoreChange(score: number): void {
    if (score >= 999999) {
      score = 999999;
    }

    if (score > TETRIS_CONFIG.bestScore) {
      TETRIS_CONFIG.bestScore = score;
      this.events.emit('onBestScoreChange');
    }

    this.score.text = score.toString();
  }

  private onLevelChange(level: number): void {
    this.level.text = level.toString();
  }

  private onWallShowed(): void {
    this.field.hide();
  }

  private onGameOverPopupClick(): void {
    this.gameOverPopup.hide();
    this.startGame();

    if (TETRIS_CONFIG.isMusicAllowed) {
      GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.TetrisMusic);
    }
  }
}
