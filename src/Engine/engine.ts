import * as THREE from 'three'

import Debug from './Utils/debug.ts'
import Sizes from './Utils/sizes.ts'
import Time from './Utils/time.ts'
import Camera from './camera.ts'
import Renderer from './renderer.ts'
import World from './World/world.ts'
import Resources from './Utils/resources'

import * as src from './sources.ts'

import './index.d.ts'

let instance: Engine;

interface Source {
    type: string;
    path: string;
    name: string;
}

export default class Engine {
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    camera: Camera;
    renderer: Renderer;
    world: World;
    debug: Debug;
    sizes: Sizes;
    time: Time;
    resources: Resources;

    isDragging: boolean = false;

    sources = src.default as unknown as Source[];
    constructor(_canvas?: HTMLCanvasElement) {
        // Singleton
        if (instance) {
            this.camera = instance.camera;
            this.scene = instance.scene;
            this.resources = instance.resources;
            this.world = instance.world;
            this.debug = instance.debug;
            this.time = instance.time;
            this.debug = instance.debug;
            this.sizes = instance.sizes;
            this.time = instance.time;
            this.renderer = instance.renderer;
            this.canvas = instance.canvas;
            return
        }
        instance = this;

        // Global access
        (window as any).engine = this

        // Options
        this.canvas = _canvas ? _canvas : new HTMLCanvasElement()

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.resources = new Resources(this.sources)
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()



        // Resize event
        this.sizes.on('resize', () => {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () => {
            this.updateRenderer()
        })
        this.time.on('logicTick', () => {
            this.world.update()
        })

        this.canvas.addEventListener('click', (event) => {
            this.raycast(event)
        })



    }

    raycast(event: any) {
        //add rayccaster
        const raycaster = new THREE.Raycaster();
        // create a Ray object from the camera position to the mouse position on screen
        const mouse = new THREE.Vector2();

        mouse.x = (event.clientX / this.sizes.width) * this.sizes.pixelRatio - 1;
        mouse.y = -(event.clientY / this.sizes.height) * this.sizes.pixelRatio + 1;
        raycaster.setFromCamera(mouse, this.camera.instance); // create a new raycaster
        const intersects = raycaster.intersectObjects(this.world.scene.children, true)
        if (intersects.length > 0) {
            this.world.setSelectedDude(intersects)
        }
    }

    getDudeParameters() {
        return this.world.getDudeParameters()
    }

    getTime(): Time {
        return this.time
    }

    getSimulationInfo() {
        return this.world.getSimulationInfo()
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    resetSimulation(noOrganisms: number, noRocks: number, planetSize: number, gravityFactor: number) {
        this.softDestroy()
        this.world.resetSimulation(noOrganisms,noRocks,planetSize,gravityFactor);
    }

    toggleOrbit() {
        this.world.toggleOrbit();
    }

    updateRenderer() {

        this.camera.update()
        this.renderer.update()
    }

    setSimulationSize(size: number): void {
        this.world.setSimulationSize(size);
    }

    softDestroy() {
        this.scene.traverse((child: any) => {
            // Test if it's a mesh
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()

                // Loop through the material properties
                for (const key in child.material) {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if (value && typeof value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }
        })
    }

    destroy() {
        this.sizes.off('resize')
        this.time.off('tick')
        this.time.off('logicTick')

        // Traverse the whole scene
        this.softDestroy()

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        if (this.debug.active)
            this.debug.ui?.destroy()
    }
}