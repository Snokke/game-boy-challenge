import { Container } from "pixi.js";

export default class ScreenAbstract extends Container {
  constructor() {
    super();
  }

  public update(): void { }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public stopTweens(): void { }

  public onButtonPress(): void { }

  public onButtonUp(): void { }
}
