import { Container, EventEmitter } from "pixi.js";
import { BUTTON_TYPE } from "../../../game-boy/data/game-boy-data";

export default abstract class GameScreenAbstract extends Container {
  public events: EventEmitter;

  private screenType: string;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.screenType = null;

    this.visible = false;
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public getScreenType(): string {
    return this.screenType;
  }

  public update(): void { }

  public abstract onButtonPress(buttonType: BUTTON_TYPE): void;

  public onButtonUp(): void { }

  public reset(): void { }

  public stopTweens(): void { }
}
