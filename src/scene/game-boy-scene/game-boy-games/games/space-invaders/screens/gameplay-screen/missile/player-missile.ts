import { Container, Sprite, Spritesheet, Texture } from 'pixi.js';
import Loader from '../../../../../../../../core/loader';
import { MISSILES_CONFIG, MISSILE_TYPE } from './missile-config';

export default class PlayerMissile extends Container {
  private type: string;
  private config: any;
  private view: Sprite;
  private speed: number;
  private isMissileActive: boolean

  constructor() {
    super();

    this.type = MISSILE_TYPE.Player;
    this.config = MISSILES_CONFIG[this.type];
    this.speed = this.config.speed;

    this.isMissileActive = false;

    this.init();
  }

  public activate(): void {
    this.isMissileActive = true;
  }

  public deactivate(): void {
    this.isMissileActive = false;
  }

  public isActive(): boolean {
    return this.isMissileActive;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public explode(): void {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['player-missile-explode.png'] as Texture;
    this.view.texture = texture;

    this.view.x -= 2;
    this.view.y -= 5;
  }

  private init(): void {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures[this.config.textures[0]] as Texture;

    const view = this.view = new Sprite(texture);
    this.addChild(view);
  }
}
