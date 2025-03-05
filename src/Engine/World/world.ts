import * as THREE from 'three'
import Engine from '../engine.ts'
import Resources from '../Utils/resources'
import Planet from './planet.ts'
import Dude, { DudeState, SelectedDudeParameters } from './dude.ts'
import LightSource from './light.ts'
import { PhysicsModule } from './physics.ts'
import Sun from './sun.ts'
import Environment from './environment.ts'
import Rock from './rock.ts'
import { PerformanceTest } from '../Utils/performance-test.ts'

export interface SimulationInfo {
    numberOfDudes: number;
    numberOfRocks: number;
}

export default class World {
    engine: Engine
    scene: THREE.Scene
    resources: Resources;
    planet?: Planet;
    dudes?: Array<Dude> = []
    rocks?: Array<Rock> = []
    light?: LightSource;
    sun?: Sun;
    environment?: Environment;

    phi: number = 0;
    selectedDudeIndex: number = 1;
    selectedDude: Dude | undefined = undefined;
    mainCameraPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    isSetToFollow = false;
    isFollowingADude = false;

    simulationScale = 0.1
    planetRadius = 0;
    dudeNumber = 0;
    rockNumber = 0;
    cameraDistance = 0;


    hashSize = 0.4
    gravity = 1;


    constructor() {
        this.engine = new Engine()
        this.scene = this.engine.scene
        this.resources = this.engine.resources




        // Wait for resources
        this.resources.on('ready', () => {

            // Setup by reset
            this.resetSimulation(300,200,2,1)

        })
    }

    resetSimulation(noOrganisms: number, noRocks: number, planetSize: number, gravityFactor: number) {
        
        // this.scene.children = []
        
        this.scene.children.filter(child => child instanceof THREE.Group || child instanceof THREE.Mesh).forEach((child: THREE.Group | THREE.Mesh) => {
            this.scene.remove(child)
        })
        this.dudes = []
        this.rocks = []
        
        
        this.planetRadius = Number(planetSize)
        this.dudeNumber = Number(noOrganisms);
        this.rockNumber = Number(noRocks);
        this.gravity =gravityFactor;
        this.engine.camera.instance.position.set(this.planetRadius + 10, 0, 0)


        this.planet = new Planet(this.planetRadius,this.resources.items["planetTexture"])
        if (!this.sun) {
            this.sun = new Sun();
        }
        if (!this.light) {
            this.light = new LightSource();
        }
        if (!this.environment) {
            this.environment = new Environment();
        }

        // generate dudes
        for (let i = 0; i < this.dudeNumber; ++i) {
            const dude = new Dude(this.planetRadius, this.gravity, this.resources.items["faceTexture"])
            this.dudes!.push(dude)
        }
        //generate rocks
        const r = this.planetRadius;
        let phi = 1
        let theta = 1;
        let dPhi = 0;
        let dTheta = 0;
        let p = 0
        let t = 0
        let diff = Math.random()
        for (let i = 0; i < this.rockNumber; i++) {
            const size = Math.random() * (this.hashSize - 0.1) + 0.1

            dPhi = (Math.random() - 0.5) * 0.2 + dPhi * diff;
            dTheta = (Math.random() - 0.5) * 0.2 + dTheta * diff;
            phi += (size * 0.1) + dPhi;
            theta += (size * 0.2) + dTheta;

            p = phi + (Math.random() - 0.5) * diff
            t = theta + (Math.random() - 0.5) * diff
            const rock = new Rock(size, new THREE.Vector3(r * Math.cos(p) * Math.sin(t), r * Math.cos(t), r * Math.sin(p) * Math.sin(t)),this.resources.items["rockTexture"])
            this.rocks?.push(rock);
        }

    }

    toggleOrbit() {
        this.isSetToFollow =!this.isSetToFollow;
        if (this.isSetToFollow) {
            this.cameraDistance = this.engine.camera.instance.position.length()
            this.engine.camera.controls.enabled = false;
        } else {
            this.cameraDistance = this.engine.camera.instance.position.length()
            this.engine.camera.controls.enabled = true;
        }
    }


    setFollow(val: boolean) {
        this.isSetToFollow = val;
    }

    setSimulationSize(size: number) {
        this.simulationScale = size;
    }

    getDudeParameters(): SelectedDudeParameters {
        if (!this.selectedDude) {
            return {}
        }
        return this.selectedDude.getParameters();
    }

    getSimulationInfo(): SimulationInfo {
        if (this.dudes === undefined || !this.rocks) {
            return {
                numberOfDudes: 0,
                numberOfRocks: 0
            }
        }
        return {
            numberOfDudes: this.dudes.length,
            numberOfRocks: this.rocks.length
        }
    }

    setSelectedDude(selectedElement: any[]): void {
        // find first dude 
        this.selectedDude = this.dudes?.find((d) => selectedElement.find((s) => s.object === d.bodyMesh));
        this.dudes?.forEach((d) => d.setSelected(false))
        if (this.selectedDude === undefined || !(this.selectedDude instanceof Dude)) {
            return;
        }
        const index = this.dudes?.indexOf(this.selectedDude);

        if (index === -1 || index !== this.selectedDudeIndex && index !== undefined) {
            this.selectedDudeIndex = index;
            this.selectedDude.setSelected(true);
        } else if (this.selectedDude === undefined) {
            this.selectedDudeIndex = -1;
        }
    }

    update() {
        this.phi += 0.0005
        const sunDirection = new THREE.Vector3(Math.cos(this.phi), 0, Math.sin(this.phi))
        if (this.dudes && this.rocks) {
            PhysicsModule.hashDudes(this.dudes.concat(this.rocks as any), this.hashSize)
            PhysicsModule.checkInteractions(this.dudes.concat(this.rocks as any), this.hashSize);
            this.dudes.forEach((dude) => {
                dude.update(sunDirection, this.planetRadius)
            })
        }

        if (this.isSetToFollow) {
            // if (this.dudes && this.dudes[this.selectedDudeIndex] && this.dudes[this.selectedDudeIndex].state !== DudeState.DEAD && this.dudes[this.selectedDudeIndex].isInDaylight) {
            //     const normalizedDirection = this.dudes[this.selectedDudeIndex].position.clone().normalize().multiplyScalar(3)

            //     this.mainCameraPosition.set(this.dudes[this.selectedDudeIndex].position.x + normalizedDirection.x, this.dudes[this.selectedDudeIndex].position.y + normalizedDirection.y, this.dudes[this.selectedDudeIndex].position.z + normalizedDirection.z)
            //     const d = this.mainCameraPosition.clone().sub(this.engine.camera.instance.position.clone()).multiplyScalar(0.006)
            //     this.engine.camera.instance.position.add(d);
            //     this.isFollowingADude = true

            // } else {
            //     this.mainCameraPosition.set(Math.cos(this.phi * 1) * (this.planetRadius + 10), Math.sin(this.phi * 0.1) * this.planetRadius, Math.sin(this.phi * 1) * (this.planetRadius + 10))
            //     const d = this.mainCameraPosition.clone().sub(this.engine.camera.instance.position.clone()).multiplyScalar(0.001)
            //     this.engine.camera.instance.position.add(d);
            //     this.isFollowingADude = false
            //     // if (this.dudes && this.dudes[this.selectedDudeIndex] && this.dudes[this.selectedDudeIndex].state === DudeState.DEAD && !this.dudes[this.selectedDudeIndex].isInDaylight) {
            //     this.selectedDudeIndex = Math.round(Math.random() * this.dudes!.length);

            //     // }
            // }
        }

        if (this.isSetToFollow) {
            const r = this.cameraDistance;
            this.mainCameraPosition.set(Math.cos(this.phi * 1) * r, 0, Math.sin(this.phi * 1) * r)
            // // const zero = new THREE.Vector3();
            const d = this.mainCameraPosition.clone().sub(this.engine.camera.instance.position.clone()).multiplyScalar(0.1)
            this.engine.camera.instance.position.add(d);
            // this.engine.camera.instance.position.set(10,0,0)
            // this.engine.camera.instance.position.set(Math.cos(this.phi * 1) * (r), 0, Math.sin(this.phi * 1) * (r))
            // this.engine.camera.instance.rotation.set(-Math.cos(this.phi * 1), Math.sin(this.phi * 0.1), -Math.sin(this.phi * 1));
        }

        this.light?.update(sunDirection, this.engine.camera.instance.position);
        this.sun?.update(sunDirection);
        this.planet?.update(sunDirection);
    }
}