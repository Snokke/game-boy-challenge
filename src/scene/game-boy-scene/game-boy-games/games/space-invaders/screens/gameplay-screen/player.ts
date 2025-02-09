import { Container, Sprite, Spritesheet, Texture } from 'pixi.js';
import Loader from '../../../../../../../core/loader';
import { PLAYER_MOVEMENT_STATE } from '../../data/space-invaders-data';

export default class Player extends Container {
  private view: Sprite;
  private playerHit: Sprite;
  private moveState: PLAYER_MOVEMENT_STATE;
  private isPlayerActive: boolean;

  constructor() {
    super();

    this.view = null;
    this.playerHit = null;
    this.moveState = PLAYER_MOVEMENT_STATE.None;
    this.isPlayerActive = true;

    this.init();
  }

  public setMovementState(direction) {
    this.moveState = direction;
  }

  public getMovementState() {
    return this.moveState;
  }

  public isActive() {
    return this.isPlayerActive;
  }

  public reset() {
    this.moveState = PLAYER_MOVEMENT_STATE.None;
    this.isPlayerActive = true;
    this.view.visible = true;
    this.playerHit.visible = false;
  }

  public showHit() {
    this.view.visible = false;
    this.playerHit.visible = true;
    this.isPlayerActive = false;
  }

  public hideHit() {
    this.view.visible = true;
    this.playerHit.visible = false;
    this.isPlayerActive = true;
  }

  private init() {
    this.initView();
    this.initHit();
  }

  private initView() {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['player.png'] as Texture;

    const view = this.view = new Sprite(texture);
    this.addChild(view);
  }

  private initHit() {
    const spriteSheet = Loader.assets['assets/spritesheets/space-invaders-sheet'] as Spritesheet;
    const texture = spriteSheet.textures['player-hit.png'] as Texture;

    const playerHit = this.playerHit = new Sprite(texture);
    this.addChild(playerHit);

    playerHit.visible = false;
  }
}
