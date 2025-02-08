import * as THREE from 'three';
import { Assets, Texture, Sprite, Spritesheet } from 'pixi.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { AudioAssets, ModelAssets, PixiAssets, TextureAssets } from '../Data/Configs/Assets/Assets';

type Asset = THREE.Texture | THREE.Audio | THREE.Object3D | Texture | Sprite | GLTF | AudioBuffer | Spritesheet;

const loadingPercentElement: Element = document.querySelector('.loading-percent');

export default class Loader {
  static assets: { [key: string]: Asset } = {};

  private threeJSManager: THREE.LoadingManager;

  constructor() {
    this.threeJSManager = new THREE.LoadingManager(this.onThreeJSAssetsLoaded, this.onThreeJSAssetsProgress);

    this.loadPixiAssets();
  }

  private loadPixiAssets(): void {
    const texturesNames: string[] = [];

    PixiAssets.forEach((assetFilename: string) => {
      const assetName = assetFilename.replace(/\.[^/.]+$/, "");

      Assets.add({ alias: assetName, src: assetFilename });
      texturesNames.push(assetName);
    });

    const texturesPromise: Promise<Record<string, Texture>> = Assets.load(texturesNames);

    texturesPromise.then((textures: { [key in string]: Texture }) => {
      texturesNames.forEach((name: string) => {
        this.onAssetLoad(textures[name], name);
      });

      this.loadThreeJSAssets();
    });
  }

  private loadThreeJSAssets(): void {
    this.loadTextures();
    this.loadModels();
    this.loadAudio();

    if (TextureAssets.length === 0 && ModelAssets.length === 0) {
      this.onThreeJSAssetsLoaded();
    }
  }

  private onThreeJSAssetsLoaded(): void {
    setTimeout(() => {
      loadingPercentElement.innerHTML = `100%`;
      loadingPercentElement.classList.add('ended');

      const customEvent = new Event('onAudioLoaded');
      document.dispatchEvent(customEvent);

      setTimeout(() => {
        (loadingPercentElement as HTMLElement).style.display = 'none';
      }, 300);
    }, 450);


    setTimeout(() => {
      const customEvent = new Event('onLoad');
      document.dispatchEvent(customEvent);
    }, 100);
  }

  private onThreeJSAssetsProgress(): void {
    const percent: number = Math.floor(0.5 * 100);
    loadingPercentElement.innerHTML = `${percent}%`;
  }

  private loadTextures(): void {
    const textureLoader = new THREE.TextureLoader(this.threeJSManager);

    const texturesBasePath: string = '/textures/';

    TextureAssets.forEach((textureFilename: string) => {
      const textureFullPath: string = `${texturesBasePath}${textureFilename}`;
      const textureName: string = textureFilename.replace(/\.[^/.]+$/, "");
      Loader.assets[textureName] = textureLoader.load(textureFullPath);
    });
  }

  private loadModels(): void {
    const gltfLoader = new GLTFLoader(this.threeJSManager);

    const modelsBasePath: string = '/models/';

    ModelAssets.forEach((modelFilename: string) => {
      const modelFullPath: string = `${modelsBasePath}${modelFilename}`;
      const modelName: string = modelFilename.replace(/\.[^/.]+$/, "");
      gltfLoader.load(modelFullPath, (gltfModel: GLTF) => this.onAssetLoad(gltfModel, modelName));
    });
  }

  private loadAudio(): void {
    const audioLoader = new THREE.AudioLoader(this.threeJSManager);

    const audioBasePath: string = '/audio/';

    AudioAssets.forEach((audioFilename: string) => {
      const audioFullPath: string = `${audioBasePath}${audioFilename}`;
      const audioName: string = audioFilename.replace(/\.[^/.]+$/, "");
      audioLoader.load(audioFullPath, (audioBuffer: AudioBuffer) => this.onAssetLoad(audioBuffer, audioName));
    });
  }

  onAssetLoad(asset: Asset, name: string) {
    Loader.assets[name] = asset;
  }
}
