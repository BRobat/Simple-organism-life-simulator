import * as THREE from 'three'
import Engine from "../engine";
import { DudeState } from './dude';


export default class Rock {
    engine: Engine;
    scene: THREE.Scene;
    geometry: THREE.IcosahedronGeometry;
    material: THREE.MeshPhongMaterial;
    mesh: THREE.Mesh;
    position: THREE.Vector3;
    size: number;

    state = DudeState.ROCK;

    constructor(size: number, position: THREE.Vector3, texture: any) {
        this.engine = new Engine();
        this.scene = this.engine.scene;
        this.position = position
        this.size = size;

        this.geometry = new THREE.IcosahedronGeometry(size, 1);
        this.material = new THREE.MeshPhongMaterial({ color: new THREE.Color(Math.random()/12,Math.random()/6 ,Math.random()/6+0.1), flatShading: true, wireframe: false });

        this.material.map = texture

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(...this.position.toArray())
        this.mesh.castShadow = true;
        this.mesh.rotation.x = Math.random() * Math.PI / 2;
        this.mesh.rotation.y = Math.random() * Math.PI / 2;
        this.mesh.rotation.z = Math.random() * Math.PI / 2;

        this.scene.add(this.mesh);
    }
}