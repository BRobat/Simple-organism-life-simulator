import * as THREE from 'three'
import Engine from '../engine.ts'
export default class LightSource {
    engine: Engine;
    scene: THREE.Scene;
    light: THREE.Light;
    pointLight: THREE.PointLight;


    constructor() {
        this.engine = new Engine();
        this.scene = this.engine.scene;
        this.light = new THREE.DirectionalLight(0xffffff);
        this.light.position.set(10, 0, 0);
        this.light.castShadow = true
        this.pointLight = new THREE.PointLight(0x88ffff, 0.2,100,0.01);
        this.scene.add(this.pointLight);


        this.scene.add(this.light)
    }

    update(sunDirection: THREE.Vector3, cameraPosition: THREE.Vector3) {
        this.light.position.x = sunDirection.x * 10;
        this.light.position.z = sunDirection.z * 10
        this.pointLight.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
    }
}