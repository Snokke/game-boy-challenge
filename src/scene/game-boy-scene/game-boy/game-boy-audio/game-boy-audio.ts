import * as THREE from 'three';
import { GAME_BOY_SOUND_TYPE } from './game-boy-audio-data';
import { GAME_BOY_SOUNDS_CONFIG } from './game-boy-audio-config';
import { SOUNDS_CONFIG } from '../../../../Data/Configs/Main/sounds-config';
// import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import Loader from '../../../../core/loader';

export default class GameBoyAudio {
  public static instance: GameBoyAudio;
  
  private audioListener: THREE.AudioListener;
  private audioGroup: THREE.Group;
  private globalVolume: number;
  private gameBoyVolume: number;
  private isSoundsEnabled: boolean;
  private isGameBoyEnabled: boolean;
  private sounds: { [key in GAME_BOY_SOUND_TYPE]?: THREE.PositionalAudio };

  constructor(audioListener: THREE.AudioListener, audioGroup: THREE.Group) {

    this.audioListener = audioListener;
    this.audioGroup = audioGroup;

    this.globalVolume = SOUNDS_CONFIG.masterVolume;
    this.gameBoyVolume = SOUNDS_CONFIG.gameBoyVolume;
    this.isSoundsEnabled = true;
    this.isGameBoyEnabled = false;
    this.sounds = {};

    this.initSounds();

    GameBoyAudio.instance = this;
  }

  private initSounds(): void {
    for (const value in GAME_BOY_SOUND_TYPE) {
      const soundType: GAME_BOY_SOUND_TYPE = GAME_BOY_SOUND_TYPE[value];
      this.initSound(soundType);
    }

    // const sound = this.sounds[GAME_BOY_SOUND_TYPE.GameBoyLoad];
    // const audioHelper = new PositionalAudioHelper(sound, 1);
    // this._audioGroup.add(audioHelper);
  }

  private initSound(soundType: GAME_BOY_SOUND_TYPE): void {
    const config = GAME_BOY_SOUNDS_CONFIG[soundType];

    const sound = new THREE.PositionalAudio(this.audioListener);
    this.audioGroup.add(sound);

    this.sounds[soundType] = sound;

    sound.setRefDistance(10);
    sound.setDirectionalCone(130, 180, 0.2);

    sound.setVolume(this.globalVolume * this.gameBoyVolume);
    sound.setLoop(config.repeat);

    document.addEventListener('onAudioLoaded', () => {
      sound.setBuffer(Loader.assets[config.fileName] as AudioBuffer);
    });
  }

  private updateVolume(): void {
    if (this.isSoundsEnabled && this.isGameBoyEnabled) {
      for (const value in GAME_BOY_SOUND_TYPE) {
        const soundType: GAME_BOY_SOUND_TYPE = GAME_BOY_SOUND_TYPE[value];
        const sound: THREE.PositionalAudio = this.sounds[soundType];
        sound.setVolume(this.globalVolume * this.gameBoyVolume);
      }
    }
  }

  private setVolumeZero(): void {
    for (const value in GAME_BOY_SOUND_TYPE) {
      const soundType: GAME_BOY_SOUND_TYPE = GAME_BOY_SOUND_TYPE[value];
      const sound: THREE.PositionalAudio = this.sounds[soundType];
      sound.setVolume(0);
    }
  }

  private stopAllSounds(): void {
    for (const value in GAME_BOY_SOUND_TYPE) {
      const soundType: GAME_BOY_SOUND_TYPE = GAME_BOY_SOUND_TYPE[value];
      const sound: THREE.PositionalAudio = this.sounds[soundType];

      if (sound.isPlaying) {
        sound.stop();
      }
    }
  }
  public static playSound(type: GAME_BOY_SOUND_TYPE): void {
    const sound = GameBoyAudio.instance.sounds[type];

    if (sound.isPlaying) {
      sound.stop();
    }

    sound.play();
  }

  public static switchSound(type: GAME_BOY_SOUND_TYPE): void {
    const sound = GameBoyAudio.instance.sounds[type];

    if (sound.isPlaying) {
      sound.stop();
    } else {
      sound.play();
    }
  }

  public static stopSound(type: GAME_BOY_SOUND_TYPE): void {
    const sound = GameBoyAudio.instance.sounds[type];

    if (sound.isPlaying) {
      sound.stop();
    }
  }

  public static changeGlobalVolume(volume: number): void {
    GameBoyAudio.instance.globalVolume = volume;
    GameBoyAudio.instance.updateVolume();
  }

  public static changeGameBoyVolume(volume: number): void {
    GameBoyAudio.instance.gameBoyVolume = volume;
    GameBoyAudio.instance.updateVolume();
  }

  public static enableSound(): void {
    GameBoyAudio.instance.isSoundsEnabled = true;
    GameBoyAudio.instance.updateVolume();
  }

  public static disableSound(): void {
    GameBoyAudio.instance.isSoundsEnabled = false;
    GameBoyAudio.instance.setVolumeZero();
  }

  public static onTurnOnGameBoy(): void {
    GameBoyAudio.instance.isGameBoyEnabled = true;
    GameBoyAudio.instance.updateVolume();
  }

  public static onTurnOffGameBoy(): void {
    GameBoyAudio.instance.isGameBoyEnabled = false;
    GameBoyAudio.instance.setVolumeZero();
    GameBoyAudio.instance.stopAllSounds();
  }
}

GameBoyAudio.instance = null;
