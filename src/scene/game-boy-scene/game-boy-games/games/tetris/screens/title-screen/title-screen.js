import { Sprite, Text, Graphics } from 'pixi.js';
import Loader from '../../../../../../../core/loader';
import { GAME_BOY_CONFIG } from '../../../../../game-boy/data/game-boy-config';
import GameScreenAbstract from '../../../shared/game-screen-abstract';
import { TETRIS_SCREEN_TYPE } from '../../data/tetris-data';
import { BUTTON_TYPE } from '../../../../../game-boy/data/game-boy-data';
import GameBoyAudio from '../../../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../../../game-boy/game-boy-audio/game-boy-audio-data';
import { TETRIS_CONFIG } from '../../data/tetris-config';
import Timeout from '../../../../../../../core/helpers/timeout';

export default class TitleScreen extends GameScreenAbstract {
  constructor() {
    super();

    this._screenType = TETRIS_SCREEN_TYPE.Title;
    this._arrow = null;
    this._blinkTimer = null;

    this._init();
  }

  show() {
    super.show();

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.TetrisMusic);
    this._blinkArrow();
  }

  onButtonPress(buttonType) {
    if (buttonType === BUTTON_TYPE.Start || buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.B) {
      this.events.emit('onStartGame');
    }

    if (buttonType === BUTTON_TYPE.Select) {
      GameBoyAudio.switchSound(GAME_BOY_SOUND_TYPE.TetrisMusic);
      TETRIS_CONFIG.isMusicAllowed = !TETRIS_CONFIG.isMusicAllowed;
    }
  }

  stopTweens() {
    if (this._blinkTimer) {
      this._blinkTimer.stop();
    }
  }

  _blinkArrow() {
    this._blinkTimer = Timeout.call(700, () => {
      this._arrow.visible = !this._arrow.visible;
      this._blinkArrow();
    });
  }

  _init() {
    this._initBackground();
    this._initStartText();
    this._initArrow();
  }

  _initBackground() {
    const spriteSheet = Loader.assets['assets/spritesheets/tetris-sheet'];
    const texture = spriteSheet.textures['title-screen.png'];

    const screen = new Sprite(texture);
    this.addChild(screen);
  }

  _initStartText() {
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

  _initArrow() {
    const arrow = this._arrow = new Graphics();
    this.addChild(arrow);

    arrow.fill(0x000000);
    arrow.moveTo(0, 0);
    arrow.lineTo(4, 3);
    arrow.lineTo(0, 6);

    arrow.x = GAME_BOY_CONFIG.screen.width * 0.5 - 45;
    arrow.y = 116;
  }
}
