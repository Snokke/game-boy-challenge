import { Container, Sprite, EventEmitter, Spritesheet, Texture } from "pixi.js";
import Loader from '../../../../../../../../core/loader';
import { ENEMIES_CONFIG, ENEMY_MOVEMENT_DIRECTION } from './data/enemy-config';
import { SPACE_INVADERS_CONFIG } from '../../../data/space-invaders-config';

export default class Enemy extends Container {
  public events: EventEmitter;

  private type: string;
  private config: any;
  private view: Sprite;
  private textureIndex: number;
  private isEnemyActive: boolean;
  private speed: number;
  private moveTime: number;
  private moveInterval: number;
  private moveDirection: ENEMY_MOVEMENT_DIRECTION;
  private isShootingEnabled: boolean;

  constructor(type: string) {
    super();

    this.events = new EventEmitter();

    this.type = type;
    this.config = ENEMIES_CONFIG[type];
    this.view = null;

    this.textureIndex = 0;
    this.isEnemyActive = false;

    this.speed = 0.5 + SPACE_INVADERS_CONFIG.currentRound * 0.5;

    if (this.speed > 10) {
      this.speed = 10;
    }

    this.moveTime = 0;
    this.moveInterval = 500 / this.speed;
    this.moveDirection = ENEMY_MOVEMENT_DIRECTION.Right;

    this.isShootingEnabled = false;

    this.init();
  }

  public update(dt: number): void {
    if (!this.isEnemyActive) {
      return;
    }

    this.moveTime += dt * 1000;

    if (this.moveTime >= this.moveInterval) {
      this.moveTime = 0;
      this.move();
    }

    if (this.isShootingEnabled) {
      this.checkToShoot();
    }
  }

  public activate(): void {
    this.isEnemyActive = true;
  }

  public getEnemyActive(): boolean {
    return this.isEnemyActive;
  }

  public show(): void {
    this.visible = true;
  }

  public getType(): string {
    return this.type;
  }

  public kill(): void {
    this.isEnemyActive = false;

    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['enemy-kill.png'] as Texture;
    this.view.texture = texture;
  }

  public setDirection(direction: ENEMY_MOVEMENT_DIRECTION): void {
    this.moveDirection = direction;
  }

  public moveDown(): void {
    this.y += 12;
  }

  public increaseSpeed(): void {
    this.speed += 1;

    if (this.speed > 15) {
      this.speed = 15;
    }

    this.moveInterval = 500 / this.speed;
  }

  public setTint(color: number): void {
    this.view.tint = color;
  }

  public enableShooting(): void {
    this.isShootingEnabled = true;
  }

  private checkToShoot(): void {
    const chance = Math.random() * 1000;

    if (chance > 998) {
      this.events.emit('shoot');
    }
  }

  private move(): void {
    if (this.x >= SPACE_INVADERS_CONFIG.field.width - this.width) {
      this.events.emit('changeDirectionToLeft');
    }

    if (this.x <= 0) {
      this.events.emit('changeDirectionToRight');
    }

    if (this.moveDirection === ENEMY_MOVEMENT_DIRECTION.Right) {
      this.x += 1;
    }

    if (this.moveDirection === ENEMY_MOVEMENT_DIRECTION.Left) {
      this.x -= 1;
    }

    this.updateTexture();
  }

  private updateTexture(): void {
    this.textureIndex = (this.textureIndex + 1) % this.config.textures.length;
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures[this.config.textures[this.textureIndex]] as Texture;
    this.view.texture = texture;
  }

  private init(): void {
    this.initView();

    this.visible = false;
  }

  private initView(): void {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures[this.config.textures[this.textureIndex]] as Texture;

    const view = this.view = new Sprite(texture);
    this.addChild(view);
  }
}
