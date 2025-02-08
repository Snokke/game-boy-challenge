import { Container, Graphics, Text } from 'pixi.js';
import { GAME_BOY_CONFIG } from '../../game-boy/data/game-boy-config';
import { TimeoutInstance, Timeout } from '../../../../core/helpers/timeout';
import { SOUNDS_CONFIG } from '../../../../Data/Configs/Main/sounds-config';

export default class VolumeOverlay extends Container {
  private volumeBarParts: Graphics[];
  private hideTimer: TimeoutInstance;

  private overlayWidth: number;
  private overlayHeight: number;

  constructor() {
    super();

    this.volumeBarParts = [];

    this.overlayWidth = 104;
    this.overlayHeight = 20;

    this.init();
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public onVolumeChanged(): void {
    const volume = SOUNDS_CONFIG.gameBoyVolume;
    this.setVolume(volume);

    this.show();

    if (this.hideTimer) {
      this.hideTimer.stop();
    }

    this.hideTimer = Timeout.call(GAME_BOY_CONFIG.volumeController.hideTime, () => {
      this.hide();
    });
  }

  public setVolume(volume: number): void {
    const volumeBarPartsCount = Math.round(volume * 20);

    for (let i = 0; i < this.volumeBarParts.length; i++) {
      if (i < volumeBarPartsCount) {
        this.volumeBarParts[i].visible = true;
      } else {
        this.volumeBarParts[i].visible = false;
      }
    }
  }

  private init(): void {
    this.initFrame();
    this.initVolumeText();
    this.initVolumeBar();

    this.pivot.x = this.width * 0.5;
    this.pivot.y = this.height * 0.5;

    this.visible = false;
  }

  private initFrame(): void {
    const borderThickness = 1;

    const frame: Graphics = new Graphics();
    this.addChild(frame);

    frame.rect(0, 0, this.overlayWidth, this.overlayHeight);
    frame.fill(0x000000);

    const background: Graphics = new Graphics();
    this.addChild(background);

    background.rect(0, 0, this.overlayWidth - borderThickness * 2, this.overlayHeight - borderThickness * 2);
    background.fill(0xffffff);

    background.x = borderThickness;
    background.y = borderThickness;
  }

  private initVolumeText(): void {
    const text: Text = new Text({
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

  private initVolumeBar(): void {
    const volumeParts: number = 20;

    for (let i = 0; i < volumeParts; i += 1) {
      const volumePart: Graphics = new Graphics();
      this.addChild(volumePart);

      volumePart.rect(0, 0, 4, 7);
      volumePart.fill(0x000000);

      volumePart.x = 2 + i * 5;
      volumePart.y = 11;

      volumePart.visible = false;
      this.volumeBarParts.push(volumePart);
    }
  }
}
