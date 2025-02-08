import * as THREE from 'three';
import { Application, EventEmitter } from 'pixi.js';
import GameBoyController from './game-boy-scene-controller';
import GameBoy from './game-boy/game-boy';
import CartridgesController from './cartridges/cartridges-controller';
import { SCENE_OBJECT_TYPE } from './data/game-boy-scene-data';
import GameBoyGames from './game-boy-games/game-boy-games.ts';
import GameBoyDebug from './game-boy-debug';
import CameraController from './camera-controller/camera-controller';
import Background from './background/background';
import SCENE_CONFIG from '../../Data/Configs/Main/scene-config';
import RaycasterController from '../raycaster-controller';

export default class GameBoyScene extends THREE.Group {
  public events: EventEmitter;

  private data: any;
  private gameBoyController: GameBoyController;
  private gameBoyGames: GameBoyGames;
  private gameBoyDebug: GameBoyDebug;
  private activeObjects: { [key in SCENE_OBJECT_TYPE]?: any };
  private cameraController: CameraController;
  private background: Background;
  private isSoundPlayed: boolean;

  constructor(data: any, raycasterController: RaycasterController) {
    super();

    this.events = new EventEmitter();

    this.data = data;
    this.data.raycasterController = raycasterController;

    this.activeObjects = {};
    this.isSoundPlayed = false;

    this.init();
  }

  public update(dt: number): void {
    if (dt > 0.1) {
      dt = 0.1;
    }

    this.gameBoyController.update(dt);
    this.gameBoyGames.update(dt);
  }

  public onPointerMove(x: number, y: number): void {
    this.gameBoyController.onPointerMove(x, y);
  }

  public onPointerDown(x: number, y: number): void {
    this.gameBoyController.onPointerDown(x, y);
  }

  public onPointerUp(): void {
    this.gameBoyController.onPointerUp();
  }

  public onWheelScroll(delta: number): void {
    this.gameBoyController.onWheelScroll(delta);
  }

  public onSoundChanged(): void {
    this.gameBoyController.onUISoundIconChanged();
  }

  private init(): void {
    this.initGameBoy();
    this.initCartridgesController();
    this.initGameBoyGames();
    this.initGameBoyDebug();
    this.initCameraController();
    this.initBackground();
    this.configureRaycaster();
    this.initGameBoyController();
    this.initEmptySound();

    this.initSignals();
  }

  private initGameBoy(): void {
    const gameBoyPixiCanvas: HTMLCanvasElement = this.data.gameBoyPixiApp.canvas;
    const gameBoyPixiApp: Application = this.data.gameBoyPixiApp;
    const audioListener: THREE.AudioListener = this.data.audioListener;
    const pixiApp: Application = this.data.pixiApp;

    const gameBoy: GameBoy = new GameBoy(gameBoyPixiCanvas, gameBoyPixiApp, audioListener, pixiApp);
    this.add(gameBoy);

    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy] = gameBoy;
  }

  private initCartridgesController(): void {
    const cartridgesController: CartridgesController = new CartridgesController();
    this.add(cartridgesController);

    this.activeObjects[SCENE_OBJECT_TYPE.Cartridges] = cartridgesController;
  }

  private initGameBoyGames(): void {
    const gameBoyPixiApp: Application = this.data.gameBoyPixiApp;

    this.gameBoyGames = new GameBoyGames(gameBoyPixiApp);
  }

  private initGameBoyDebug(): void {
    this.gameBoyDebug = new GameBoyDebug();
  }

  private initCameraController(): void {
    this.cameraController = new CameraController(this.data.camera);
  }

  private initBackground(): void {
    const background: Background = this.background = new Background();
    this.add(background);

    this.activeObjects[SCENE_OBJECT_TYPE.Background] = background;
  }

  private configureRaycaster(): void {
    const allMeshes: THREE.Mesh[] = [];
    const gameBoy: GameBoy = this.activeObjects[SCENE_OBJECT_TYPE.GameBoy] as GameBoy;
    const cartridges: CartridgesController = this.activeObjects[SCENE_OBJECT_TYPE.Cartridges] as CartridgesController;

    allMeshes.push(...gameBoy.getAllMeshes() as THREE.Mesh[]);
    allMeshes.push(...cartridges.getAllMeshes());
    allMeshes.push(this.background.getMesh());

    this.data.raycasterController.addMeshes(allMeshes);
  }

  private initGameBoyController(): void {
    this.data.activeObjects = this.activeObjects;
    this.data.games = this.gameBoyGames;
    this.data.gameBoyDebug = this.gameBoyDebug;
    this.data.cameraController = this.cameraController;
    this.data.background = this.background;

    this.gameBoyController = new GameBoyController(this.data);
  }

  private initEmptySound(): void {
    if (SCENE_CONFIG.isMobile) {
      window.addEventListener('touchstart', () => {
        if (this.isSoundPlayed) {
          return;
        }

        const sound = new THREE.PositionalAudio(this.data.audioListener);
        sound.setVolume(0);
        sound.play();

        this.isSoundPlayed = true;
      });
    }
  }

  private initSignals(): void {
    this.gameBoyController.events.on('fpsMeterChanged', () => this.events.emit('fpsMeterChanged'));
    this.gameBoyController.events.on('onSoundsEnabledChanged', () => this.events.emit('onSoundsEnabledChanged'));
  }
}
