import * as THREE from 'three';
import { Application, Ticker } from 'pixi.js';
import TWEEN from 'three/addons/libs/tween.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import SCENE_CONFIG from '../Data/Configs/Main/scene-config';
import MainScene from '../main-scene';
import LoadingOverlay from './LoadingOverlay';
import Loader from './loader';
import Scene3DDebugMenu from './helpers/gui-helper/scene-3d-debug-menu';
import DEBUG_CONFIG from './configs/debug-config';
import WebGL from 'three/addons/capabilities/WebGL.js';
import isMobile from 'ismobilejs';
import { GAME_BOY_CONFIG } from '../scene/game-boy-scene/game-boy/data/game-boy-config';
import { GLOBAL_LIGHT_CONFIG } from '../Data/Configs/Main/global-light-config';

export default class BaseScene {
  private pixiApp: Application;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private loadingOverlay: LoadingOverlay;
  private mainScene: MainScene;
  private scene3DDebugMenu: Scene3DDebugMenu;
  private effectComposer: EffectComposer;
  private outlinePass: OutlinePass;
  private orbitControls: any;
  private audioListener: THREE.AudioListener;
  private gameBoyPixiApp: Application;
  private fxaaPass: ShaderPass;

  private windowSizes: { width: number, height: number };
  private isAssetsLoaded: boolean;

  private isKeyboardShortcutsShown: boolean;

  constructor() {
    this.isAssetsLoaded = false;

    SCENE_CONFIG.isMobile = isMobile(window.navigator).any;
    this.isKeyboardShortcutsShown = false;

    this.init();
  }

  public createGameScene(): void {
    const data = {
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      orbitControls: this.orbitControls,
      outlinePass: this.outlinePass,
      audioListener: this.audioListener,
      pixiApp: this.pixiApp,
      gameBoyPixiApp: this.gameBoyPixiApp,
    };

    this.mainScene = new MainScene(data);

    this.initMainSceneSignals();
  }

  public afterAssetsLoaded(): void {
    this.isAssetsLoaded = true;

    this.loadingOverlay.hide();
    this.scene3DDebugMenu.showAfterAssetsLoad();
    this.mainScene.afterAssetsLoad();
    this.setupBackgroundColor();

    this.showCopyrights();
    this.showTextToLandscape();
    this.keyboardControls();
  }

  public getOutlinePass(): OutlinePass {
    return this.outlinePass;
  }

  public initMainSceneSignals(): void {
    this.mainScene.events.on('fpsMeterChanged', () => this.scene3DDebugMenu.onFpsMeterClick());
  }

  private async init(): Promise<void> {
    this.initLoader();
    await this.initPixiJS();
    await this.initGameBoyPixiJS();
    this.initThreeJS();
    this.initUpdate();
  }

  private initLoader(): void {
    new Loader();
  }

  private async initPixiJS(): Promise<void> {
    const canvas = document.querySelector('.pixi-canvas') as HTMLCanvasElement;
    const pixiApp = this.pixiApp = new Application();

    await pixiApp.init({
      canvas: canvas,
      autoDensity: true,
      width: window.innerWidth,
      height: window.innerHeight,
      resizeTo: window,
      backgroundAlpha: 0,
    });

    Ticker.shared.autoStart = false;
    Ticker.shared.stop();
  }

  private async initGameBoyPixiJS(): Promise<void> {
    const canvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = GAME_BOY_CONFIG.screen.width;
    canvas.height = GAME_BOY_CONFIG.screen.height;

    const gameBoyPixiApp = this.gameBoyPixiApp = new Application();

    await gameBoyPixiApp.init({
      canvas: canvas,
      autoDensity: true,
      width: GAME_BOY_CONFIG.screen.width,
      height: GAME_BOY_CONFIG.screen.height,
      background: GAME_BOY_CONFIG.screen.tint,
      backgroundAlpha: 0,
    });

    Ticker.shared.autoStart = false;
    Ticker.shared.stop();

    this.gameBoyPixiApp.renderer.background.alpha = 1;
  }

  private initThreeJS(): void {
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initLights();
    this.initLoadingOverlay();
    this.initOnResize();
    this.initPostProcessing();
    this.initAudioListener();

    this.initScene3DDebugMenu();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
  }

  private initRenderer(): void {
    this.windowSizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const canvas: HTMLCanvasElement = document.querySelector('.threejs-canvas') as HTMLCanvasElement;

    const renderer = this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: SCENE_CONFIG.antialias,
    });

    renderer.setSize(this.windowSizes.width, this.windowSizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio));

    // renderer.useLegacyLights = false;
    // renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1;

    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private initCamera(): void {
    const camera = this.camera = new THREE.PerspectiveCamera(50, this.windowSizes.width / this.windowSizes.height, 0.5, 70);
    this.scene.add(camera);

    camera.position.set(0, 0, 6);
  }

  private initLights(): void {
    if (GLOBAL_LIGHT_CONFIG.ambient.enabled) {
      const ambientLight = new THREE.AmbientLight(GLOBAL_LIGHT_CONFIG.ambient.color, GLOBAL_LIGHT_CONFIG.ambient.intensity);
      this.scene.add(ambientLight);
    }
  }

  private initLoadingOverlay(): void {
    const loadingOverlay = this.loadingOverlay = new LoadingOverlay();
    this.scene.add(loadingOverlay);
  }

  private initOnResize(): void {
    window.addEventListener('resize', () => this.onResize());
  }

  private onResize(): void {
    this.windowSizes.width = window.innerWidth;
    this.windowSizes.height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio);

    this.camera.aspect = this.windowSizes.width / this.windowSizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.windowSizes.width, this.windowSizes.height);
    this.renderer.setPixelRatio(pixelRatio);

    if (this.effectComposer) {
      this.effectComposer.setSize(this.windowSizes.width, this.windowSizes.height);
      this.effectComposer.setPixelRatio(pixelRatio);
    }

    if (SCENE_CONFIG.fxaaPass) {
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.windowSizes.width * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.windowSizes.height * pixelRatio);
    }

    if (this.mainScene) {
      this.mainScene.onResize();
    }
  }

  private setupBackgroundColor(): void {
    this.scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);
  }

  private initPostProcessing(): void {
    if (SCENE_CONFIG.isMobile) {
      return;
    }

    this.initEffectsComposer();
    this.initOutlinePass();
    this.initAntiAliasingPass();
  }

  private initEffectsComposer(): void {
    const pixelRatio: number = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio);

    if (WebGL.isWebGL2Available() && pixelRatio === 1) {
      const size: THREE.Vector2 = this.renderer.getDrawingBufferSize(new THREE.Vector2());
      const target: THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(size.width, size.height, { samples: 3 });
      this.effectComposer = new EffectComposer(this.renderer, target);
    } else {
      SCENE_CONFIG.fxaaPass = true;
      this.effectComposer = new EffectComposer(this.renderer);
    }

    const renderPass: RenderPass = new RenderPass(this.scene, this.camera);
    this.effectComposer.addPass(renderPass);
  }

  private initOutlinePass(): void {
    const outlinePass = this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
    this.effectComposer.addPass(outlinePass);

    const outlinePassConfig = SCENE_CONFIG.outlinePass;

    outlinePass.visibleEdgeColor.set(outlinePassConfig.color);
    outlinePass.edgeGlow = outlinePassConfig.edgeGlow;
    outlinePass.edgeStrength = outlinePassConfig.edgeStrength;
    outlinePass.edgeThickness = outlinePassConfig.edgeThickness;
    outlinePass.pulsePeriod = outlinePassConfig.pulsePeriod;
  }

  private initAntiAliasingPass(): void {
    if (SCENE_CONFIG.fxaaPass) {
      const fxaaPass = this.fxaaPass = new ShaderPass(FXAAShader);
      this.effectComposer.addPass(fxaaPass);

      const pixelRatio: number = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio);
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.windowSizes.width * pixelRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.windowSizes.height * pixelRatio);
    }
  }

  private initAudioListener(): void {
    const audioListener = this.audioListener = new THREE.AudioListener();
    this.camera.add(audioListener);
  }

  private initScene3DDebugMenu(): void {
    this.scene3DDebugMenu = new Scene3DDebugMenu(this.camera, this.renderer, this.pixiApp);
    this.orbitControls = this.scene3DDebugMenu.getOrbitControls();
  }

  private showCopyrights(): void {
    const copyrights: HTMLElement = document.querySelector('.copyrights');
    copyrights.innerHTML = `
    Nintendo logo is trademark of Nintendo.
    Tetris logo and Tetriminos are trademarks of Tetris Holding.
    Space Invaders logo is trademark of Taito Corporation.
    `;

    if (SCENE_CONFIG.isMobile) {
      copyrights.style['font-size']  = '5px';
      copyrights.style['width'] = '350px';
      copyrights.style['bottom'] = '5px';
    }

    copyrights.classList.add('show');
  }

  private showTextToLandscape(): void {
    if (SCENE_CONFIG.isMobile && window.innerWidth < window.innerHeight) {
      const introText: Element = document.querySelector('.rotate-to-landscape');
      introText.innerHTML = 'To use cartridges rotate to landscape';

      introText.classList.add('show');

      window.addEventListener('resize', () => {
        if (window.innerWidth > window.innerHeight) {
          introText.classList.add('hide');
        }
      });

      introText.addEventListener('click', () => {
        introText.classList.add('hide');
      });
    }
  }

  private keyboardControls(): void {
    if (SCENE_CONFIG.isMobile) {
      const keyboardIcon: Element = document.querySelector('.keyboard-icon');
      keyboardIcon.classList.add('hide');
    } else {
      const keyboardIcon: Element = document.querySelector('.keyboard-icon');
      const keyboardShortcuts: Element = document.querySelector('.keyboard-shortcuts');
      keyboardShortcuts.classList.add('fastShow');

      keyboardIcon.addEventListener('click', () => {
        this.isKeyboardShortcutsShown = !this.isKeyboardShortcutsShown;

        if (this.isKeyboardShortcutsShown) {
          keyboardShortcuts.classList.remove('hide');
          keyboardShortcuts.classList.add('show');
        } else {
          keyboardShortcuts.classList.remove('show');
          keyboardShortcuts.classList.add('hide');
        }
      });
      const list: HTMLUListElement = document.createElement('ul');
      keyboardShortcuts.appendChild(list);

      const items: string[] = [
        'Arrows, WASD — D-pad',
        'Z, Space — A button',
        'X — B button',
        'Enter — START',
        'Scroll — Zoom',
      ];

      items.forEach(item => {
        const listItem: HTMLLIElement = document.createElement('li');
        listItem.innerHTML = `${item}`;
        list.appendChild(listItem);
      });
    }
  }

  private initUpdate(): void {
    const clock = new THREE.Clock(true);

    const update = () => {
      this.scene3DDebugMenu.preUpdate();

      const deltaTime = clock.getDelta();

      if (this.isAssetsLoaded) {
        TWEEN.update();
        this.scene3DDebugMenu.update();

        if (this.mainScene) {
          this.mainScene.update(deltaTime);
        }

        if (SCENE_CONFIG.isMobile || DEBUG_CONFIG.rendererStats) {
          this.renderer.render(this.scene, this.camera);
        } else {
          this.effectComposer.render();
        }
      }

      this.scene3DDebugMenu.postUpdate();
      window.requestAnimationFrame(update);
    }

    update();
  }
}
