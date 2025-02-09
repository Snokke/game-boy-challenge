import { EventEmitter } from "pixi.js";
import GameAbstract from "../game-abstract";
import GameBoyAudio from '../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../game-boy/game-boy-audio/game-boy-audio-data';

export default class Zelda extends GameAbstract {
  public events: EventEmitter;

  constructor() {
    super();

    this.events = new EventEmitter();
  }

  public show(): void {
    super.show();

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.ZeldaIntro);
  }

  public update(): void {
    
  }

  public onButtonPress(): void {
    
  }

  public onButtonUp(): void {
    
  }
}
