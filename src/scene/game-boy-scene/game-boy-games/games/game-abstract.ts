import { Container } from "pixi.js";
import { BUTTON_TYPE } from "../../game-boy/data/game-boy-data";

export default abstract class GameAbstract extends Container {
  constructor() {
    super();
  }

  public abstract update(dt: number): void;

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public stopTweens(): void { }

  public abstract onButtonPress(buttonType: BUTTON_TYPE): void;

  public abstract onButtonUp(buttonType: BUTTON_TYPE): void;
}
