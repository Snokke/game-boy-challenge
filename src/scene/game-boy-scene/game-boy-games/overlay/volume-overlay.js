import * as PIXI from 'pixi.js';
import { GAME_BOY_CONFIG } from '../../game-boy/data/game-boy-config';
import Delayed from '../../../../core/helpers/delayed-call';

export default class VolumeOverlay extends PIXI.Container {
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
    const volume = GAME_BOY_CONFIG.volume;
    this.setVolume(volume);

    this.show();

    if (this._hideTimer) {
      this._hideTimer.stop();
    }

    this._hideTimer = Delayed.call(GAME_BOY_CONFIG.volumeController.hideTime, () => {
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

    const frame = new PIXI.Graphics();
    this.addChild(frame);

    frame.beginFill(GAME_BOY_CONFIG.screen.blackColor);
    frame.drawRect(0, 0, this._width, this._height);
    frame.endFill();

    const background = new PIXI.Graphics();
    this.addChild(background);

    background.beginFill(GAME_BOY_CONFIG.screen.whiteColor);
    background.drawRect(0, 0, this._width - borderThickness * 2, this._height - borderThickness * 2);
    background.endFill();

    background.x = borderThickness;
    background.y = borderThickness;
  }

  _initVolumeText() {
    const text = new PIXI.Text('VOLUME', new PIXI.TextStyle({
      fontFamily: 'tetris',
      fontSize: 8,
      fill: GAME_BOY_CONFIG.screen.blackColor,
    }));

    this.addChild(text);

    text.x = 3;
  }

  _initVolumeBar() {
    const volumeParts = 20;

    for (let i = 0; i < volumeParts; i += 1) {
      const volumePart = new PIXI.Graphics();
      this.addChild(volumePart);

      volumePart.beginFill(GAME_BOY_CONFIG.screen.blackColor);
      volumePart.drawRect(0, 0, 4, 7);
      volumePart.endFill();

      volumePart.x = 2 + i * 5;
      volumePart.y = 11;

      volumePart.visible = false;
      this._volumeBarParts.push(volumePart);
    }
  }
}
