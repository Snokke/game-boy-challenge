import { Sprite, Text, Graphics, Spritesheet, Texture } from 'pixi.js';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import GameScreenAbstract from '../../../shared/game-screen-abstract';
import { TETRIS_SCREEN_TYPE } from '../../data/tetris-data';
import { BUTTON_TYPE } from '../../../../../game-boy/data/game-boy-data';
import GameBoyAudio from '../../../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../../../game-boy/game-boy-audio/game-boy-audio-data';
import { TETRIS_CONFIG } from '../../data/tetris-config';
import { Timeout, TimeoutInstance } from '../../../../../../../core/helpers/timeout';

export default class TitleScreen extends GameScreenAbstract {
  protected screenType: string = TETRIS_SCREEN_TYPE.Title;
  private arrow: Graphics;
  private blinkTimer: TimeoutInstance;

  constructor() {
    super();

    this.arrow = null;
    this.blinkTimer = null;

    this.init();
  }

  public show(): void {
    super.show();

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.TetrisMusic);
    this.blinkArrow();
  }

  public onButtonPress(buttonType: BUTTON_TYPE): void {
    if (buttonType === BUTTON_TYPE.Start || buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.B) {
      this.events.emit('onStartGame');
    }

    if (buttonType === BUTTON_TYPE.Select) {
      GameBoyAudio.switchSound(GAME_BOY_SOUND_TYPE.TetrisMusic);
      TETRIS_CONFIG.isMusicAllowed = !TETRIS_CONFIG.isMusicAllowed;
    }
  }

  public stopTweens(): void {
    if (this.blinkTimer) {
      this.blinkTimer.stop();
    }
  }

  public update(): void { }

  public onButtonUp(): void {
    
  }

  private blinkArrow(): void {
    this.blinkTimer = Timeout.call(700, () => {
      this.arrow.visible = !this.arrow.visible;
      this.blinkArrow();
    });
  }

  private init(): void {
    this.initBackground();
    this.initStartText();
    this.initArrow();
  }

  private initBackground(): void {
    const spriteSheet = Loader.assets['assets/spritesheets/tetris-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['title-screen.png'] as Texture;

    const screen = new Sprite(texture);
    this.addChild(screen);
  }

  private initStartText(): void {
    const text = new Text({
      text: 'Start game',
      style: {
        fontFamily: 'tetris',
        fontSize: 8,
      },
    });

    this.addChild(text);

    text.anchor.set(0.5, 0);

    text.x = GAME_BOY_CONFIG.screen.width * 0.5;
    text.y = 113;
  }

  private initArrow(): void {
    const arrow = this.arrow = new Graphics();
    this.addChild(arrow);

    arrow.fill(0x000000);
    arrow.moveTo(0, 0);
    arrow.lineTo(4, 3);
    arrow.lineTo(0, 6);

    arrow.x = GAME_BOY_CONFIG.screen.width * 0.5 - 45;
    arrow.y = 116;
  }
}
