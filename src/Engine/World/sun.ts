import * as THREE from 'three'
import Engine from '../engine.ts'


export default class Sun {
    engine: Engine;
    scene: THREE.Scene;
    geometry: THREE.IcosahedronGeometry;
    material: THREE.MeshBasicMaterial;
    mesh: THREE.Mesh;

    constructor() {
        this.engine = new Engine();
        this.scene = this.engine.scene;

        this.geometry = this.setGeometry();
        this.material = this.setMaterial();
        this.mesh = this.setMesh();
        this.scene.add(this.mesh);
    }

    setGeometry(): THREE.IcosahedronGeometry {
        return new THREE.IcosahedronGeometry(2, 4);
    }

    setMaterial(): THREE.MeshBasicMaterial {
        return new THREE.MeshBasicMaterial({ color: 0xffffff });
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        return this.mesh;
    }

    update(sunDirection: THREE.Vector3) {
        this.mesh.position.x = sunDirection.x * 500;
        this.mesh.position.z = sunDirection.z * 500
    }
}