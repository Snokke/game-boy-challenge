import * as THREE from 'three';
import { Application } from 'pixi.js';
import DEBUG_CONFIG from "../../../Data/Configs/Main/debug-config";
import RendererStats from 'three-webgl-stats';
import Stats from 'three/addons/libs/stats.module.js';
import GUIHelper from "./gui-helper";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default class Scene3DDebugMenu {
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private pixiApp: Application;

  private fpsStats: Stats;
  private rendererStats: RendererStats;
  private orbitControls: OrbitControls;
  private isAssetsLoaded: boolean;

  constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, pixiApp: Application) {
    this.camera = camera;
    this.renderer = renderer;
    this.pixiApp = pixiApp;

    this.isAssetsLoaded = false;

    this.init();
  }

  public preUpdate(): void {
    if (DEBUG_CONFIG.fpsMeter) {
      this.fpsStats.begin();
    }
  }

  public postUpdate(): void {
    if (DEBUG_CONFIG.fpsMeter) {
      this.fpsStats.end();
    }
  }

  public update(): void {
    if (DEBUG_CONFIG.orbitControls) {
      this.orbitControls.update();
    }

    if (DEBUG_CONFIG.rendererStats) {
      this.rendererStats.update(this.renderer);
    }
  }

  public showAfterAssetsLoad(): void {
    this.isAssetsLoaded = true;

    if (DEBUG_CONFIG.fpsMeter) {
      this.fpsStats.dom.style.visibility = 'visible';
    }

    if (DEBUG_CONFIG.rendererStats) {
      this.rendererStats.domElement.style.visibility = 'visible';
    }

    if (DEBUG_CONFIG.orbitControls) {
      this.orbitControls.enabled = true;
    }

    GUIHelper.instance.showAfterAssetsLoad();
  }

  public getOrbitControls(): OrbitControls {
    return this.orbitControls;
  }

  private init(): void {
    this.initRendererStats();
    this.initFPSMeter();
    this.initOrbitControls();

    this.initLilGUIHelper();
  }

  private initRendererStats(): void {
    if (DEBUG_CONFIG.rendererStats) {
      const rendererStats = this.rendererStats = new RendererStats();

      rendererStats.domElement.style.position = 'absolute';
      rendererStats.domElement.style.left = '0px';
      rendererStats.domElement.style.bottom = '0px';
      document.body.appendChild(rendererStats.domElement);

      if (!this.isAssetsLoaded) {
        this.rendererStats.domElement.style.visibility = 'hidden';
      }
    }
  }

  private initFPSMeter(): void {
    if (DEBUG_CONFIG.fpsMeter) {
      const stats = this.fpsStats = new Stats();
      stats.showPanel(0);
      document.body.appendChild(stats.dom);

      if (!this.isAssetsLoaded) {
        this.fpsStats.dom.style.visibility = 'hidden';
      }
    }
  }

  private initOrbitControls(): void {
    const orbitControls = this.orbitControls = new OrbitControls(this.camera, this.pixiApp.renderer.canvas);

    orbitControls.target.set(0, 0, 0);

    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.07;
    orbitControls.rotateSpeed = 0.5;
    orbitControls.panSpeed = 0.5;

    if (!this.isAssetsLoaded) {
      orbitControls.enabled = false;
    }
  }

  private initLilGUIHelper(): void {
    new GUIHelper();
  }

  public onFpsMeterClick(): void {
    if (DEBUG_CONFIG.fpsMeter) {
      if (!this.fpsStats) {
        this.initFPSMeter();
      }
      this.fpsStats.dom.style.display = 'block';
    } else {
      this.fpsStats.dom.style.display = 'none';
    }
  }

  public onRendererStatsClick(rendererStatsState: boolean): void {
    if (DEBUG_CONFIG.rendererStats) {
      if (rendererStatsState) {
        if (!this.rendererStats) {
          this.initRendererStats();
        }

        this.rendererStats.domElement.style.display = 'block';
      } else {
        this.rendererStats.domElement.style.display = 'none';
      }
    }
  }

  public onOrbitControlsClick(orbitControlsState: boolean): void {
    if (orbitControlsState) {
      if (!this.orbitControls) {
        this.initOrbitControls();
      }

      this.orbitControls.enabled = true;
    } else {
      this.orbitControls.enabled = false;
    }
  }
}
