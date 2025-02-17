import { Container, Sprite, Spritesheet, Texture } from 'pixi.js';
import { TETRIS_CONFIG } from '../../data/tetris-config';
import Loader from '../../../../../../../core/loader';
import { SHAPE_CONFIG, SHAPE_TYPE } from './field/shape/shape-config';

export default class NextShape extends Container {
  private shapeType: string;
  private blocksView: Sprite[][];
  private shapePivot: any;
  private shapeWidth: number;
  private shapeHeight: number;

  constructor(type: string) {
    super();

    this.shapeType = type;
    this.blocksView = [];
    this.shapePivot = null;

    this.shapeWidth = 0;
    this.shapeHeight = 0;

    this.init();
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public getWidth(): number {
    return this.shapeWidth;
  }

  public getHeight(): number {
    return this.shapeHeight;
  }

  private init(): void {
    if (this.shapeType === SHAPE_TYPE.I) {
      this.initShapeI();
    } else {
      this.initShape();
    }

    this.cacheAsTexture(true);
  }

  private initShapeI() {
    const config = SHAPE_CONFIG[this.shapeType];
    const blocksView = config.blocksView;

    const spriteSheet = Loader.assets['assets/spritesheets/tetris-sheet'] as Spritesheet;
    const blockTexture = spriteSheet.textures[config.textureMiddle] as Texture;
    const edgeTexture = spriteSheet.textures[config.textureEdge] as Texture;

    for (let row = 0; row < blocksView.length; row++) {
      this.blocksView[row] = [];

      for (let column = 0; column < blocksView[0].length; column++) {
        if (blocksView[row][column] === 1) {
          const texture = (column === 0 || column === blocksView[0].length - 1) ? edgeTexture : blockTexture;
          const block = new Sprite(texture);
          this.addChild(block);

          this.blocksView[row][column] = block;
        } else {
          this.blocksView[row][column] = null;
        }
      }
    }

    this.shapeHeight = this.blocksView.length * TETRIS_CONFIG.blockSize + 16;
    this.shapeWidth = this.blocksView[0].length * TETRIS_CONFIG.blockSize - 16;
    this.shapePivot = config.pivot;
    this.updateShapeIBlocksPosition();
  }

  private initShape() {
    const config = SHAPE_CONFIG[this.shapeType];
    const blocksView = config.blocksView;
    const spriteSheet = Loader.assets['assets/spritesheets/tetris-sheet'] as Spritesheet;
    const blockTexture = spriteSheet.textures[config.texture] as Texture;

    for (let row = 0; row < blocksView.length; row++) {
      this.blocksView[row] = [];

      for (let column = 0; column < blocksView[0].length; column++) {
        if (blocksView[row][column] === 1) {
          const block = new Sprite(blockTexture);
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

    this.shapeHeight = this.blocksView.length * TETRIS_CONFIG.blockSize;

    if (this.shapeType === SHAPE_TYPE.Invisible) {
      this.shapeHeight = this.blocksView.length * TETRIS_CONFIG.blockSize * 3;
    }

    this.shapeWidth = this.blocksView[0].length * TETRIS_CONFIG.blockSize;
    this.shapePivot = config.pivot;
    this.updateShapeBlocksPosition();
  }

  private updateShapeBlocksPosition() {
    let index = 0;

    for (let row = 0; row < this.blocksView.length; row++) {
      for (let column = 0; column < this.blocksView[0].length; column++) {
        const block = this.blocksView[row][column];

        if (block !== null) {
          block.x = (column - this.shapePivot.x) * TETRIS_CONFIG.blockSize;
          block.y = (row - this.shapePivot.y) * TETRIS_CONFIG.blockSize;

          index += 1;
        }
      }
    }
  }

  private updateShapeIBlocksPosition() {
    let index = 0;

    for (let row = 0; row < this.blocksView.length; row++) {
      for (let column = 0; column < this.blocksView[0].length; column++) {
        const block = this.blocksView[row][column];

        if (block !== null) {
          block.rotation = 0;
          block.x = (column - this.shapePivot.x) * TETRIS_CONFIG.blockSize;
          block.y = (row - this.shapePivot.y) * TETRIS_CONFIG.blockSize;

          if (column === this.blocksView[0].length - 1) {
            block.rotation = Math.PI;
            block.x += 1 * TETRIS_CONFIG.blockSize;
            block.y += 1 * TETRIS_CONFIG.blockSize;
          }

          index += 1;
        }
      }
    }
  }
}
