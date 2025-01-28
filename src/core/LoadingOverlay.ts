import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';

export default class LoadingOverlay extends THREE.Group {
  private overlayMaterial: THREE.ShaderMaterial;

  constructor() {
    super();

    this.init();
  }

  public hide(): void {
    new TWEEN.Tween(this.overlayMaterial.uniforms.uAlpha)
      .to({ value: 0 }, 400)
      .easing(TWEEN.Easing.Linear.None)
      .start()
      .onComplete(() => {
        this.visible = false;
      });
  }

  private init(): void {
    const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    const overlayMaterial = this.overlayMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: { value: 1 },
      },
      vertexShader: `
        void main()
        {
          gl_Position = vec4(position, 0.5);
        }
      `,
      fragmentShader: `
        uniform float uAlpha;

        void main()
        {
          gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
      `,
    });

    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    this.add(overlay);
  }
}
