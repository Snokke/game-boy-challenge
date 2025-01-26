import { EventEmitter } from "pixi.js";
import GameAbstract from "../game-abstract";
import GameBoyAudio from '../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../game-boy/game-boy-audio/game-boy-audio-data';

export default class Zelda extends GameAbstract {
  constructor() {
    super();

    this.events = new EventEmitter();
  }

  show() {
    super.show();

    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.ZeldaIntro);
  }
}
