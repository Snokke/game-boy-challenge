import * as THREE from 'three';
import { GAME_BOY_SOUND_TYPE } from './game-boy-audio-data';
import { GAME_BOY_SOUNDS_CONFIG } from './game-boy-audio-config';
import { SOUNDS_CONFIG } from '../../../../core/configs/sounds-config';
import Loader from '../../../../core/loader';

export default class GameBoyAudio {
  constructor(audioListener, audioGroup) {

    this._audioListener = audioListener;
    this._audioGroup = audioGroup;

    this._globalVolume = SOUNDS_CONFIG.masterVolume;
    this._gameBoyVolume = SOUNDS_CONFIG.gameBoyVolume;
    this._isSoundsEnabled = true;
    this.sounds = {};

    this._initSounds();

    GameBoyAudio.instance = this;
  }

  _initSounds() {
    for (const value in GAME_BOY_SOUND_TYPE) {
      const soundType = GAME_BOY_SOUND_TYPE[value];
      this._initSound(soundType);
    }
  }

  _initSound(soundType) {
    const config = GAME_BOY_SOUNDS_CONFIG[soundType];

    const sound = new THREE.PositionalAudio(this._audioListener);
    this._audioGroup.add(sound);

    this.sounds[soundType] = sound;

    sound.setRefDistance(10);
    sound.setVolume(this._globalVolume * this._gameBoyVolume);

    Loader.events.on('onAudioLoaded', () => {
      sound.setBuffer(Loader.assets[config.fileName]);
    });
  }

  _updateVolume() {
    if (this._isSoundsEnabled) {
      for (const value in GAME_BOY_SOUND_TYPE) {
        const soundType = GAME_BOY_SOUND_TYPE[value];
        const sound = this.sounds[soundType];
        sound.setVolume(this._globalVolume * this._gameBoyVolume);
      }
    }
  }

  _setVolumeZero() {
    for (const value in GAME_BOY_SOUND_TYPE) {
      const soundType = GAME_BOY_SOUND_TYPE[value];
      const sound = this.sounds[soundType];
      sound.setVolume(0);
    }
  }

  static playSound(type) {
    const sound = GameBoyAudio.instance.sounds[type];

    if (sound.isPlaying) {
      sound.stop();
    }

    sound.play();
  }

  static changeGlobalVolume(volume) {
    GameBoyAudio.instance._globalVolume = volume;
    GameBoyAudio.instance._updateVolume();
  }

  static changeGameBoyVolume(volume) {
    GameBoyAudio.instance._gameBoyVolume = volume;
    GameBoyAudio.instance._updateVolume();
  }

  static enableSound() {
    GameBoyAudio.instance._isSoundsEnabled = true;
    GameBoyAudio.instance._updateVolume();
  }

  static disableSound() {
    GameBoyAudio.instance._isSoundsEnabled = false;
    GameBoyAudio.instance._setVolumeZero();
  }
}

GameBoyAudio.instance = null;
