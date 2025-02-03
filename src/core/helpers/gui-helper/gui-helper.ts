import { Pane, FolderApi, TpChangeEvent } from 'tweakpane';
// import isMobile from 'ismobilejs';
import DEBUG_CONFIG from '../../../Data/Configs/Main/debug-config';

export default class GUIHelper {
  public static instance: GUIHelper | null = null;

  private gui: Pane;

  constructor() {
    this.gui = new Pane({
      title: 'Control panel',
    });

    (<any>this.gui).hidden = true;
    (<any>this.gui).containerElem_.style.width = '275px';

    // const isMobileDevice = isMobile(window.navigator).any;

    // if (isMobileDevice) {
      (<any>this.gui).expanded = false;
    // }

    GUIHelper.instance = this;

    return this.gui as any;
  }

  public getFolder(name: string): FolderApi | null {
    const folders = (<any>this.gui).children as FolderApi[];

    for (let i = 0; i < folders.length; i += 1) {
      const folder = folders[i];

      if (folder.title === name) {
        return folder;
      }
    }

    return null;
  }

  public getController(folder: FolderApi, name: string): TpChangeEvent | null {
    for (let i = 0; i < folder.children.length; i += 1) {
      const controller = folder.children[i] as TpChangeEvent;

      if (controller.label === name) {
        return controller;
      }
    }

    return null;
  }

  public getControllerFromFolder(folderName: string, controllerName: string): TpChangeEvent | null {
    const folder = this.getFolder(folderName);

    if (folder) {
      return this.getController(folder, controllerName);
    }

    return null;
  }

  public showAfterAssetsLoad(): void {
    if (!DEBUG_CONFIG.withoutUIMode) {
      (<any>this.gui).hidden = false;
    }
  }

  public static getGui(): Pane {
    return GUIHelper.instance!.gui;
  }

  public static getFolder(name: string): FolderApi | null {
    return GUIHelper.instance!.getFolder(name);
  }

  public static getController(folder: FolderApi, name: string): TpChangeEvent | null {
    return GUIHelper.instance!.getController(folder, name);
  }

  public static getControllerFromFolder(folderName: string, controllerName: string): TpChangeEvent | null {
    return GUIHelper.instance!.getControllerFromFolder(folderName, controllerName);
  }
}

GUIHelper.instance = null;
