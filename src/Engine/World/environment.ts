import * as THREE from 'three'
import Engine from "../engine";

export default class Environment {
    engine: Engine;
    scene: THREE.Scene;



    constructor() {
        this.engine = new Engine();
        this.scene = this.engine.scene;

        this.setEnvironmentMap();

    }

    setEnvironmentMap() {
        const rgbeLoader = new THREE.TextureLoader()
        rgbeLoader.load('backgrounds/starmap_4k.jpg', (environmentMap) => {
            // this.scene.background = environmentMap;
            // this.scene.environment = environmentMap;
        }, (progress) => {

        },
            (error) => {

            });
    }
}