import * as THREE from 'three';
import GUIHelper from '../../core/helpers/gui-helper/gui-helper';
import { GAME_BOY_CONFIG } from './game-boy/data/game-boy-config';
import { MessageDispatcher } from 'black-engine';

export default class GameBoyDebug extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._rotationDragController = null;

    this._init();
  }

  disableRotationDrag() {
    this._rotationDragController.disabled = true;
    this._rotationDragController.refresh();
  }

  enableRotationDrag() {
    this._rotationDragController.disabled = false;
    this._rotationDragController.refresh();
  }

  _init() {
    const gui = GUIHelper.getGui();

    gui.addInput(GAME_BOY_CONFIG.rotation, 'rotationCursorEnabled', {
      label: 'Rotation cursor',
    }).on('change', () => {
      this.events.post('rotationCursorChanged');
    });

    this._rotationDragController = gui.addInput(GAME_BOY_CONFIG.rotation, 'rotationDragEnabled', {
      label: 'Rotation drag',
    }).on('change', () => {
      this.events.post('rotationDragChanged');
    });
  }
}
