import * as THREE from 'three'
import Sizes from './Utils/sizes.ts';
import Engine from './engine.ts';
import Camera from './camera.ts';

export default class EngineRenderer{
    engine: Engine;
    canvas: HTMLCanvasElement;
    sizes: Sizes;
    scene: THREE.Scene;
    camera: Camera;
    instance: THREE.WebGLRenderer;

    constructor() {
        this.engine = new Engine()
        this.canvas = this.engine.canvas ? this.engine.canvas : new HTMLCanvasElement()
        this.sizes = this.engine.sizes ? this.engine.sizes : new Sizes();
        this.scene = this.engine.scene
        this.camera = this.engine.camera
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        this.setInstance()
    }

    setInstance() {
        if (!this.instance) {
            return;
        }
        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1.75
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setClearColor('#211d20')
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    resize() {
        if (!this.instance) {
            return;
        }
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    update() {
        if (!this.instance) {
            return;
        }
        this.instance.render(this.scene, this.camera.instance)
    }
}