import * as PIXI from 'pixi.js';
import GameAbstract from "../game-abstract";
import GameBoyAudio from '../../../game-boy/game-boy-audio/game-boy-audio';
import { GAME_BOY_SOUND_TYPE } from '../../../game-boy/game-boy-audio/game-boy-audio-data';

export default class Zelda extends GameAbstract {
  constructor() {
    super();

    this.events = new PIXI.utils.EventEmitter();
  }

  show() {
    super.show();

    this.events.emit('onShow');
    GameBoyAudio.playSound(GAME_BOY_SOUND_TYPE.ZeldaIntro);
  }
}
