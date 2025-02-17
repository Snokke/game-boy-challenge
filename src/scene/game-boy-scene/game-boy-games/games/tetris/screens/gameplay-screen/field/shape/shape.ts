import { Container, Point, Sprite, Spritesheet, Texture } from 'pixi.js';
import { TETRIS_CONFIG } from '../../../../data/tetris-config';
import Loader from '../../../../../../../../../core/loader';
import { DIRECTION_SEQUENCE, ROTATE_TYPE, SHAPE_CONFIG, SHAPE_DIRECTION, SHAPE_TYPE } from './shape-config';

export default class Shape extends Container {
  private type: SHAPE_TYPE;
  private blocksView: (Sprite | null)[][];
  private shapePivot: Point;
  private direction: SHAPE_DIRECTION;
  private blockPosition: Point;
  private distanceFallen: number;

  constructor(type: SHAPE_TYPE) {
    super();

    this.type = type;
    this.blocksView = [];
    this.shapePivot = new Point(0, 0);
    this.direction = SHAPE_DIRECTION.Up;
    this.blockPosition = new Point(0, 0);
    this.distanceFallen = 0;

    this.init();
  }

  public setPosition(x: number, y: number): void {
    this.blockPosition.set(x, y);

    this.x = this.blockPosition.x * TETRIS_CONFIG.blockSize;
    this.y = this.blockPosition.y * TETRIS_CONFIG.blockSize;
  }

  public moveRight(): void {
    this.x += TETRIS_CONFIG.blockSize;
    this.blockPosition.x += 1;
  }

  public moveLeft(): void {
    this.x -= TETRIS_CONFIG.blockSize;
    this.blockPosition.x -= 1;
  }

  public moveDown(): void {
    this.y += TETRIS_CONFIG.blockSize;
    this.blockPosition.y += 1;

    this.distanceFallen += 1;
  }

  public getBlockPosition(): Point {
    return this.blockPosition;
  }

  public getBlocksView(): (Sprite | null)[][] {
    return this.blocksView;
  }

  public getPivot(): Point {
    return this.shapePivot;
  }

  public getType(): SHAPE_TYPE {
    return this.type;
  }

  public getFallenDistance(): number {
    return this.distanceFallen;
  }

  public getDirection(): SHAPE_DIRECTION {
    return this.direction;
  }

  public rotate(rotateType: ROTATE_TYPE): void {
    if (SHAPE_CONFIG[this.type].availableDirections.length === 0) {
      return;
    }

    if (rotateType === ROTATE_TYPE.Clockwise) {
      this.rotateClockwise();
    } else {
      this.rotateCounterClockwise();
    }

    if (this.type === SHAPE_TYPE.I) {
      this.updateShapeIBlocksPosition();
    } else {
      this.updateShapeBlocksPosition();
    }
  }

  private rotateClockwise(): void {
    const blocksView: (Sprite | null)[][] = this.blocksView;
    const newBlocksView: (Sprite | null)[][] = [];

    for (let row = 0; row < blocksView[0].length; row++) {
      newBlocksView.push([]);

      for (let column = 0; column < blocksView.length; column++) {
        newBlocksView[row][column] = blocksView[blocksView.length - column - 1][row];
      }
    }

    this.blocksView = newBlocksView;
    this.shapePivot = new Point(this.blocksView[0].length - this.shapePivot.y - 1, this.shapePivot.x);

    const availableDirections: SHAPE_DIRECTION[] = SHAPE_CONFIG[this.type].availableDirections;
    this.direction = this.getNextDirection();

    if (!availableDirections.includes(this.direction)) {
      this.rotateClockwise();
    }
  }

  private rotateCounterClockwise(): void {
    const blocksView: (Sprite | null)[][] = this.blocksView;
    const newBlocksView: (Sprite | null)[][] = [];

    for (let row = 0; row < blocksView[0].length; row++) {
      newBlocksView.push([]);

      for (let column = 0; column < blocksView.length; column++) {
        newBlocksView[row][column] = blocksView[column][blocksView[0].length - row - 1];
      }
    }

    this.blocksView = newBlocksView;
    this.shapePivot = new Point(this.shapePivot.y, this.blocksView.length - this.shapePivot.x - 1);

    const availableDirections: SHAPE_DIRECTION[] = SHAPE_CONFIG[this.type].availableDirections;
    this.direction = this.getPreviousDirection();

    if (!availableDirections.includes(this.direction)) {
      this.rotateCounterClockwise();
    }
  }

  private getNextDirection(): SHAPE_DIRECTION {
    let newDirection: SHAPE_DIRECTION;

    for (let i = 0; i < DIRECTION_SEQUENCE.length; i += 1) {
      if (DIRECTION_SEQUENCE[i] === this.direction) {
        if (i === DIRECTION_SEQUENCE.length - 1) {
          newDirection = DIRECTION_SEQUENCE[0];
        } else {
          newDirection = DIRECTION_SEQUENCE[i + 1];
        }

        break;
      }
    }

    return newDirection;
  }

  private getPreviousDirection(): SHAPE_DIRECTION {
    let newDirection: SHAPE_DIRECTION;

    for (let i = 0; i < DIRECTION_SEQUENCE.length; i += 1) {
      if (DIRECTION_SEQUENCE[i] === this.direction) {
        if (i === 0) {
          newDirection = DIRECTION_SEQUENCE[DIRECTION_SEQUENCE.length - 1];
        } else {
          newDirection = DIRECTION_SEQUENCE[i - 1];
        }

        break;
      }
    }

    return newDirection;
  }

  private init(): void {
    if (this.type === SHAPE_TYPE.I) {
      this.initShapeI();
    } else {
      this.initShape();
    }
  }

  private initShapeI(): void {
    const config: any = SHAPE_CONFIG[this.type];
    const blocksView: number[][] = config.blocksView;

    const spriteSheet: Spritesheet = Loader.assets['assets/spritesheets/tetris-sheet'] as Spritesheet;
    const blockTexture: Texture = spriteSheet.textures[config.textureMiddle] as Texture;
    const edgeTexture: Texture = spriteSheet.textures[config.textureEdge] as Texture;

    for (let row = 0; row < blocksView.length; row++) {
      this.blocksView[row] = [];

      for (let column = 0; column < blocksView[0].length; column++) {
        if (blocksView[row][column] === 1) {
          const texture: Texture = (column === 0 || column === blocksView[0].length - 1) ? edgeTexture : blockTexture;
          const block: Sprite = new Sprite(texture);
          this.addChild(block);

          this.blocksView[row][column] = block;
        } else {
          this.blocksView[row][column] = null;
        }
      }
    }

    this.shapePivot = config.pivot;
    this.updateShapeIBlocksPosition();
  }

  private initShape(): void {
    const config: any = SHAPE_CONFIG[this.type];
    const blocksView: number[][] = config.blocksView;
    const spriteSheet: Spritesheet = Loader.assets['assets/spritesheets/tetris-sheet'] as Spritesheet;
    const blockTexture: Texture = spriteSheet.textures[config.texture] as Texture;

    for (let row = 0; row < blocksView.length; row++) {
      this.blocksView[row] = [];

      for (let column = 0; column < blocksView[0].length; column++) {
        if (blocksView[row][column] === 1) {
          const block: Sprite = new Sprite(blockTexture);
          this.addChild(block);

          if (config.tint) {
            block.tint = config.tint;
          }

          this.blocksView[row][column] = block;
        } else {
          this.blocksView[row][column] = null;
        }
      }
    }

    this.shapePivot = config.pivot;
    this.updateShapeBlocksPosition();

    if (this.type === SHAPE_TYPE.Invisible) {
      this.alpha = 0.5;

      // Uncomment the following lines if you want to enable blinking effect
      // this._blinkTween = new TWEEN.Tween(this)
      //   .to({ alpha: 0.3 }, 700)
      //   .easing(TWEEN.Easing.Sinusoidal.InOut)
      //   .yoyo(true)
      //   .repeat(Infinity)
      //   .start();
    }
  }

  private updateShapeBlocksPosition(): void {
    let index: number = 0;

    for (let row: number = 0; row < this.blocksView.length; row++) {
      for (let column: number = 0; column < this.blocksView[0].length; column++) {
        const block: Sprite | null = this.blocksView[row][column];

        if (block !== null) {
          block.x = (column - this.shapePivot.x) * TETRIS_CONFIG.blockSize;
          block.y = (row - this.shapePivot.y) * TETRIS_CONFIG.blockSize;

          index += 1;
        }
      }
    }
  }

  private updateShapeIBlocksPosition(): void {
    let index: number = 0;

    for (let row: number = 0; row < this.blocksView.length; row++) {
      for (let column: number = 0; column < this.blocksView[0].length; column++) {
        const block: Sprite | null = this.blocksView[row][column];

        if (block !== null) {
          if (this.direction === SHAPE_DIRECTION.Up) {
            block.rotation = 0;
            block.x = (column - this.shapePivot.x) * TETRIS_CONFIG.blockSize;
            block.y = (row - this.shapePivot.y) * TETRIS_CONFIG.blockSize;

            if (column === this.blocksView[0].length - 1) {
              block.rotation = Math.PI;
              block.x += 1 * TETRIS_CONFIG.blockSize;
              block.y += 1 * TETRIS_CONFIG.blockSize;
            }
          }

          if (this.direction === SHAPE_DIRECTION.Left) {
            block.rotation = -Math.PI * 0.5;
            block.x = (column - this.shapePivot.y + 2) * TETRIS_CONFIG.blockSize;
            block.y = (row - this.shapePivot.x - 1) * TETRIS_CONFIG.blockSize;

            if (row === 0) {
              block.rotation = Math.PI * 0.5;
              block.x += 1 * TETRIS_CONFIG.blockSize;
              block.y -= 1 * TETRIS_CONFIG.blockSize;
            }
          }

          index += 1;
        }
      }
    }
  }
}
