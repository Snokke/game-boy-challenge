import DEBUG_CONFIG from "../../configs/debug-config";
import RendererStats from 'three-webgl-stats';
import Stats from 'three/addons/libs/stats.module.js';
import GUIHelper from "./gui-helper";
import { OrbitControls } from "three/addons/controls/OrbitControls";

export default class Scene3DDebugMenu {
  constructor(scene, camera, renderer, pixiApp) {
    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;
    this.pixiApp = pixiApp;

    this._fpsStats = null;
    this._rendererStats = null;
    this._orbitControls = null;
    this._gridHelper = null;
    this._axesHelper = null;
    this._baseGUI = null;

    this._isAssetsLoaded = false;

    this._init();
  }

  preUpdate() {
    if (DEBUG_CONFIG.fpsMeter) {
      this._fpsStats.begin();
    }
  }

  postUpdate() {
    if (DEBUG_CONFIG.fpsMeter) {
      this._fpsStats.end();
    }
  }

  update() {
    if (DEBUG_CONFIG.orbitControls) {
      this._orbitControls.update();
    }

    if (DEBUG_CONFIG.rendererStats) {
      this._rendererStats.update(this._renderer);
    }
  }

  showAfterAssetsLoad() {
    this._isAssetsLoaded = true;

    if (DEBUG_CONFIG.fpsMeter) {
      this._fpsStats.dom.style.visibility = 'visible';
    }

    if (DEBUG_CONFIG.rendererStats) {
      this._rendererStats.domElement.style.visibility = 'visible';
    }

    if (DEBUG_CONFIG.orbitControls) {
      this._orbitControls.enabled = true;
    }

    GUIHelper.instance.showAfterAssetsLoad();
  }

  getOrbitControls() {
    return this._orbitControls;
  }

  _init() {
    this._initRendererStats();
    this._initFPSMeter();
    this._initOrbitControls();

    this._initLilGUIHelper();
  }

  _initRendererStats() {
    if (DEBUG_CONFIG.rendererStats) {
      const rendererStats = this._rendererStats = new RendererStats();

      rendererStats.domElement.style.position = 'absolute';
      rendererStats.domElement.style.left = '0px';
      rendererStats.domElement.style.bottom = '0px';
      document.body.appendChild(rendererStats.domElement);

      if (!this._isAssetsLoaded) {
        this._rendererStats.domElement.style.visibility = 'hidden';
      }
    }
  }

  _initFPSMeter() {
    if (DEBUG_CONFIG.fpsMeter) {
      const stats = this._fpsStats = new Stats();
      stats.showPanel(0);
      document.body.appendChild(stats.dom);

      if (!this._isAssetsLoaded) {
        this._fpsStats.dom.style.visibility = 'hidden';
      }
    }
  }

  _initOrbitControls() {
    const orbitControls = this._orbitControls = new OrbitControls(this._camera, this.pixiApp.renderer.canvas);

    orbitControls.target.set(0, 0, 0);

    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.07;
    orbitControls.rotateSpeed = 0.5;
    orbitControls.panSpeed = 0.5;

    if (!this._isAssetsLoaded) {
      orbitControls.enabled = false;
    }
  }

  _initLilGUIHelper() {
    new GUIHelper();
  }

  onFpsMeterClick() {
    if (DEBUG_CONFIG.fpsMeter) {
      if (!this._fpsStats) {
        this._initFPSMeter();
      }
      this._fpsStats.dom.style.display = 'block';
    } else {
      this._fpsStats.dom.style.display = 'none';
    }
  }

  onRendererStatsClick(rendererStatsState) {
    if (DEBUG_CONFIG.rendererStats) {
      if (rendererStatsState) {
        if (!this._rendererStats) {
          this._initRendererStats();
        }

        this._rendererStats.domElement.style.display = 'block';
      } else {
        this._rendererStats.domElement.style.display = 'none';
      }
    }
  }

  onOrbitControlsClick(orbitControlsState) {
    if (orbitControlsState) {
      if (!this._orbitControls) {
        this._initOrbitControls();
      }

      this._orbitControls.enabled = true;
    } else {
      this._orbitControls.enabled = false;
    }
  }
}
