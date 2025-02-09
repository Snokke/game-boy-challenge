import { Container, Sprite, Spritesheet, Texture } from 'pixi.js';
import Loader from '../../../../../../../../core/loader';
import { MISSILES_CONFIG } from './missile-config';

export default class EnemyMissile extends Container {
  private type: string;
  private config: any;
  private view: Sprite;
  private speed: number;
  private isMissileActive: boolean;
  private textureIndex: number;

  constructor(type: string) {
    super();

    this.type = type;
    this.config = MISSILES_CONFIG[this.type];
    this.speed = this.config.speed;

    this.isMissileActive = false;
    this.textureIndex = 0;

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
    const texture = spriteSheet.textures['enemy-missile-explode.png'] as Texture;
    this.view.texture = texture;

    this.view.x -= 2;
  }

  public updateTexture(): void {
    this.textureIndex = (this.textureIndex + 1) % this.config.textures.length;
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures[this.config.textures[this.textureIndex]] as Texture;
    this.view.texture = texture;
  }

  private init(): void {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures[this.config.textures[this.textureIndex]] as Texture;

    const view = this.view = new Sprite(texture);
    this.addChild(view);
  }
}
