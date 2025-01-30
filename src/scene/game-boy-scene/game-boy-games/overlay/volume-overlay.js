import { Container, Graphics, Text } from 'pixi.js';
import { GAME_BOY_CONFIG } from '../../game-boy/data/game-boy-config';
import Timeout from '../../../../core/helpers/timeout';
import { SOUNDS_CONFIG } from '../../../../Data/Configs/Main/sounds-config';

export default class VolumeOverlay extends Container {
  constructor() {
    super();

    this._volumeBarParts = [];
    this._hideTimer = null;

    this._width = 104;
    this._height = 20;

    this._init();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  onVolumeChanged() {
    const volume = SOUNDS_CONFIG.gameBoyVolume;
    this.setVolume(volume);

    this.show();

    if (this._hideTimer) {
      this._hideTimer.stop();
    }

    this._hideTimer = Timeout.call(GAME_BOY_CONFIG.volumeController.hideTime, () => {
      this.hide();
    });
  }

  setVolume(volume) {
    const volumeBarPartsCount = Math.round(volume * 20);

    for (let i = 0; i < this._volumeBarParts.length; i++) {
      if (i < volumeBarPartsCount) {
        this._volumeBarParts[i].visible = true;
      } else {
        this._volumeBarParts[i].visible = false;
      }
    }
  }

  _init() {
    this._initFrame();
    this._initVolumeText();
    this._initVolumeBar();

    this.pivot.x = this.width * 0.5;
    this.pivot.y = this.height * 0.5;

    this.visible = false;
  }

  _initFrame() {
    const borderThickness = 1;

    const frame = new Graphics();
    this.addChild(frame);

    frame.rect(0, 0, this._width, this._height);
    frame.fill(0x000000);

    const background = new Graphics();
    this.addChild(background);

    background.rect(0, 0, this._width - borderThickness * 2, this._height - borderThickness * 2);
    background.fill(0xffffff);

    background.x = borderThickness;
    background.y = borderThickness;
  }

  _initVolumeText() {
    const text = new Text({
        text: 'VOLUME',
        style: {
            fontFamily: 'tetris',
            fontSize: 8,
            fill: 0x000000,
        },
    });

    this.addChild(text);

    text.x = 3;
  }

  _initVolumeBar() {
    const volumeParts = 20;

    for (let i = 0; i < volumeParts; i += 1) {
      const volumePart = new Graphics();
      this.addChild(volumePart);

      volumePart.rect(0, 0, 4, 7);
      volumePart.fill(0x000000);

      volumePart.x = 2 + i * 5;
      volumePart.y = 11;

      volumePart.visible = false;
      this._volumeBarParts.push(volumePart);
    }
  }
}
