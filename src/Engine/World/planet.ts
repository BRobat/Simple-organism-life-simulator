import * as THREE from 'three'
import Engine from '../engine.ts'

import atmosphereVertexShader from '../shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from '../shaders/atmosphere/fragment.glsl'

import planetVertexShader from '../shaders/planet/vertex.glsl'
import planetFragmentShader from '../shaders/planet/fragment.glsl'

export default class Planet {
    engine: Engine;
    scene: THREE.Scene;
    geometry: THREE.IcosahedronGeometry;
    material: THREE.ShaderMaterial | THREE.MeshStandardMaterial;
    mesh: THREE.Mesh;
    texture: any;

    atmosphereGeometry: THREE.IcosahedronGeometry;
    atmosphereMaterial: THREE.ShaderMaterial;
    atmosphereMesh: THREE.Mesh
    radius: number;

    colorVector: THREE.Color;

    constructor(radius: number, texture: any) {
        this.texture = texture;
        this.engine = new Engine();
        this.scene = this.engine.scene;
        this.radius = radius;

        this.colorVector = new THREE.Color(Math.random()/12,Math.random()/2,Math.random()/2)

        this.geometry = this.setGeometry();
        this.material = this.setMaterial();
        this.mesh = this.setMesh();
        // this.mesh.scale.z = 1.5;

        this.atmosphereGeometry = this.setAtmosphereGeometry();
        this.atmosphereMaterial = this.setAtmosphereMaterial();
        this.atmosphereMesh = this.setAtmosphereMesh();

        this.mesh.castShadow = true;



    }

    setGeometry(): THREE.IcosahedronGeometry {
        return new THREE.IcosahedronGeometry(this.radius, 6);
    }

    setAtmosphereGeometry(): THREE.IcosahedronGeometry {
        return new THREE.IcosahedronGeometry(this.radius + 0.5 + Math.random()/2, 24);
    }

    setMaterial(): THREE.ShaderMaterial | THREE.MeshStandardMaterial {

        const material2 = new THREE.MeshStandardMaterial({ color: new THREE.Color(this.colorVector.r,this.colorVector.g+0.2,this.colorVector.b+0.2), flatShading: true, wireframe: false });
        
        material2.onBeforeCompile = (shader) => {
            // shader.uniforms.uSunDirection = new THREE.Uniform(new THREE.Vector3(0, 0, 1));
            // shader.uniforms.uAtmosphereDayColor = new THREE.Uniform(new THREE.Color("#333"));
            // shader.uniforms.uAtmosphereTwilightColor = new THREE.Uniform(new THREE.Color("#0aa"));
            // shader.uniforms.uDayColor = new THREE.Uniform(new THREE.Color("#245"));
            // shader.uniforms.uNightColor = new THREE.Uniform(new THREE.Color("#122"));

        }







        const material = new THREE.ShaderMaterial({
            vertexShader: planetVertexShader,
            fragmentShader: planetFragmentShader,
            visible: true,
            uniforms:
            {
                uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
                uAtmosphereDayColor: new THREE.Uniform(new THREE.Color("#333")),
                uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color("#0aa")),
                uDayColor: new THREE.Uniform(new THREE.Color("#3ba")),
                uNightColor: new THREE.Uniform(new THREE.Color("#122")),
            }
        })

        material.defaultAttributeValues = { 'color': [1, 1, 1] }

        material2.map = this.texture;
        if (material2.map) {
            material2.map.repeat = new THREE.Vector2(1,1);
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            // material2.map.anisotropy = 16;

            material2.map.magFilter = THREE.LinearFilter;

            // material2.map.offset = new THREE.Vector2(0, -0.8);
        }

        return material2;
    }

    setAtmosphereMaterial(): THREE.ShaderMaterial {
        const material = new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            side: THREE.BackSide,
            transparent: true,
            visible: true,
            uniforms: {
                uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
                uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(this.colorVector.r,this.colorVector.g+0.5,this.colorVector.b+0.5)),
                uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(this.colorVector.r,this.colorVector.g,this.colorVector.b+0.3))

            }
        }
        )

        return material;
    }

    setMesh(): THREE.Mesh {
        const mesh = new THREE.Mesh(this.geometry, this.material)
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
    }

    setAtmosphereMesh() {
        const mesh = new THREE.Mesh(this.atmosphereGeometry, this.atmosphereMaterial)
        mesh.receiveShadow = false;
        this.scene.add(mesh);
        return mesh;
    }

    update(sunDirection: THREE.Vector3): void {
        this.atmosphereMaterial.uniforms["uSunDirection"].value = sunDirection;
        // this.material.uniforms["uSunDirection"].value = new THREE.Vector3(Math.cos(phi), 0, Math.sin(phi));
    }

}