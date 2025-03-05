import * as THREE from 'three'
import Engine from '../engine.ts'
import { NameGenerator } from '../Utils/name-generator.ts';

export enum DudeState {
    DEAD = 'dead',
    ALIVE = 'alive',
    ROCK = 'rock',
}

export interface SelectedDudeParameters {
    name?: string,
    hp?: number,
    maxHp?: number,
    energy?: number,
    maxEnergy?: number,
    lifeLength?: number,
    attackStrength?: number,
    jumpStrength?: number,
    jumpCost?: number,
}

// attributes are values from 0 to 1
export interface Attributes {
    lifeLength: number;
    jumpStrength: number;
    attackStrength: number;
    attackCooldown: number;
    maxHp: number;
    maxEnergy: number;
    visionRadius: number;

    enemyReactionVector: THREE.Vector3;
    allyReactionVector: THREE.Vector3;
    foodReactionVector: THREE.Vector3;

    // defines species
    color: THREE.Vector3;
}

export default class Dude {
    engine: Engine;
    scene: THREE.Scene;
    material: THREE.MeshPhongMaterial;

    attackMesh: THREE.Mesh;
    lifeMesh: THREE.Mesh;
    defenseMesh: THREE.Mesh;

    selectionMesh: THREE.Mesh;

    groupedMeshes: THREE.Group;
    bodyMesh: THREE.Mesh;

    attributes: Attributes = this.setAttributes(undefined);

    state: DudeState = DudeState.ALIVE;
    direction: THREE.Vector3;
    speed: THREE.Vector3;
    position: THREE.Vector3;

    name: string = 'Dude';
    size: number = 0.05;
    maxEnergy: number = 1;
    energy: number = 1;
    courage: number = 1;
    maxHp: number = 1;
    hp: number = 1;
    lifeExpectancy: number = 0.0005;

    attackStrength: number = 1;
    attackCooldown: number = 1;
    attackCost: number = 0.2;

    attackTime: number = 0;

    visionRadius: number = 1;
    jumpStrength: number = 1;
    jumpCost: number = 0.5;

    gravity: number;

    isInDaylight: boolean = false;

    // brain
    enemyReactionVector: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    allyReactionVector: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    foodReactionVector: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    constructor(planetRadius: number, gravity: number, texture: any) {
        this.engine = new Engine();
        this.scene = this.engine.scene;

        this.gravity = gravity;


        // this.geometry = this.setGeometry();
        this.material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0x888), wireframe: false, flatShading: false });
        // apply texture to material
        this.material.map = texture;
        if (this.material.map) {
            this.material.map.repeat = new THREE.Vector2(2, 2);
            this.material.map.magFilter = THREE.NearestFilter;
            this.material.map.offset = new THREE.Vector2(0, -0.99);
            // this.material.map.
        }

        this.updateAttributes(undefined);


        this.groupedMeshes = this.setMeshGroup(planetRadius);
        this.groupedMeshes.castShadow = false;

        this.bodyMesh = this.setBodyMesh()
        this.groupedMeshes.add(this.bodyMesh);

        this.attackMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x880088), wireframe: true, opacity: 0.5, transparent: true }));
        this.lifeMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x00aa00), wireframe: true, opacity: 0.5, transparent: true }));
        this.defenseMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xaa0000), wireframe: true, opacity: 0.5, transparent: true }));

        this.selectionMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x00ff66), transparent: true, opacity: 0.3, wireframe: false, depthWrite: false }));
        this.selectionMesh.visible = false;

        this.groupedMeshes.add(this.lifeMesh);
        this.groupedMeshes.add(this.attackMesh);
        this.groupedMeshes.add(this.defenseMesh);
        this.groupedMeshes.add(this.selectionMesh);


        this.position = this.groupedMeshes.position;
        this.direction = new THREE.Vector3(Math.random(), Math.random(), Math.random());

        this.speed = new THREE.Vector3(0, 0, 0);

        this.updateBaseAppearance();
    }

    update(sunDirection: THREE.Vector3, planetRadius: number) {

        const r = this.position.length()
        if (this.state !== DudeState.DEAD && Math.random() < this.lifeExpectancy || this.state === DudeState.DEAD && Math.random() < 0.00001) {
            this.setState(DudeState.DEAD);
        }



        if (r < planetRadius + this.size / 2) {
            this.zeroSpeed();
            if (this.state !== DudeState.DEAD && (Math.random() * this.energy) / this.maxEnergy > 0.5 && this.energy > this.jumpCost) {
                this.accelerate(r, planetRadius, true);
                this.jump();
            } else if (this.state === DudeState.DEAD) {
                this.accelerate(r, planetRadius);
            }
        } else {
            this.accelerate(r, planetRadius);
        }
        this.move();


        this.direction = new THREE.Vector3(0, 0, 0);


        this.updateAppearance();
        this.attackTime += 1;
        if (this.hp < this.maxHp && this.energy > 0) {
            this.hp += 0.01;
            this.energy -= 0.05;
        }


        // 
        if (this.energy < this.maxEnergy && sunDirection.clone().normalize().add(this.position.clone().normalize()).length() > 1.2) {
            this.isInDaylight = true;
        } else {
            this.isInDaylight = false;

        }
        if (this.isInDaylight) {
            this.energy += this.size * 10;
        }
    }



    updateAttributes(attributes?: Attributes): void {
        this.attributes = this.setAttributes(attributes);
        this.jumpStrength = this.attributes.jumpStrength * 0.015 + 0.001;
        this.visionRadius = this.attributes.visionRadius;
        this.lifeExpectancy = this.attributes.lifeLength * 0.001;
        this.attackStrength = this.attributes.attackStrength * 100;
        this.attackCooldown = this.attributes.attackCooldown * 36;
        this.maxHp = this.attributes.maxHp * 1000;
        this.hp = this.maxHp;
        this.maxEnergy = this.attributes.maxEnergy * 1000;
        this.energy = this.maxEnergy / 2
        this.size = Math.pow((this.attributes.maxHp + 0.5) * (this.attributes.maxEnergy + 0.5), 2) * 0.01 + 0.03
        this.jumpCost = Math.pow(((this.size + 2) * (this.attributes.jumpStrength + 0.5)), 2) * 5
        this.attackCost = this.size * this.attackStrength;
        this.enemyReactionVector = new THREE.Vector3(this.attributes.enemyReactionVector.x * 0.1 + 0.01, this.attributes.enemyReactionVector.y - 0.5, this.attributes.enemyReactionVector.z - 0.5);
        this.allyReactionVector = new THREE.Vector3(this.attributes.allyReactionVector.x * 5 + 1, this.attributes.allyReactionVector.y - 0.5, this.attributes.allyReactionVector.z - 0.5);
        this.foodReactionVector = new THREE.Vector3(this.attributes.foodReactionVector.x - 0.5, this.attributes.foodReactionVector.y - 0.5, this.attributes.foodReactionVector.z - 0.5);
        this.updateColor(new THREE.Color(this.attributes.color.x, this.attributes.color.y, this.attributes.color.z));

        this.updateName();
        this.updateBaseAppearance();
    }

    getParameters(): SelectedDudeParameters {
        if (this.state === DudeState.DEAD) {

            return {
                name: "DISC",
            }
        }
        return {
            name: this.name,
            maxHp: this.maxHp,
            maxEnergy: this.maxEnergy,
            energy: this.energy,
            hp: this.hp,
            attackStrength: this.attackStrength,
            jumpStrength: this.jumpStrength,
            jumpCost: this.jumpCost,
        }
    }

    setState(state: DudeState): void {
        this.state = state
        if (state === DudeState.DEAD) {
            this.setSelected(false)
            this.updateColor(new THREE.Color(this.attributes.color.x * 0.3, this.attributes.color.y * 0.3, this.attributes.color.z * 0.3));
            // this.material.wireframe = true
            this.material.transparent = true
            this.material.depthWrite = false
            this.material.opacity = 0.4;
            // this.lifeMesh.visible  = false;
        } else {
            // this.material.wireframe = false
            this.material.depthWrite = true
            this.material.transparent = false
            // this.lifeMesh.visible = true;
        }
        this.updateBaseAppearance();
    }

    performAttack(): number {
        this.attackTime = 0;
        const damage = this.attackStrength;
        this.energy -= this.attackCost;
        this.attackMesh.visible = true;
        return damage;

    }

    takeDamage(damage: number): void {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.setState(DudeState.DEAD)
            this.energy = 0;
        }
        this.defenseMesh.visible = true;
    }

    giveLife(): void {
        this.energy -= this.maxEnergy / 3;
        this.lifeMesh.visible = true;
    }

    dispose() {
        this.bodyMesh.geometry.dispose();
        this.engine.scene.remove(this.groupedMeshes);
    }

    setSelected(selected: boolean): void {
        this.selectionMesh.visible = selected;
    }

    private setMeshGroup(planetRadius: number): THREE.Group {
        const group = new THREE.Group();
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI * 0.8 + Math.PI * 0.1;
        const r = planetRadius * 1.1
        group.position.z = r * Math.cos(phi) * Math.sin(theta);
        group.position.x = r * Math.sin(phi) * Math.sin(theta);
        group.position.y = r * Math.cos(theta);
        group.receiveShadow = true;
        group.scale.setScalar(this.size)
        this.scene.add(group);
        return group;
    }

    private setBodyMesh(): THREE.Mesh {
        const baseGeometry = new THREE.IcosahedronGeometry(1, 1);
        baseGeometry.rotateX(Math.PI / 2);

        const mesh = new THREE.Mesh(baseGeometry, this.material)
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    private updateBodyMesh(): void {
    }



    private updateColor(color: THREE.Color): void {
        this.material.color = color.clone();
        this.material.needsUpdate = true;
    }

    private updateName(): void {
        this.name = NameGenerator.generateName(this.attributes.color)
    }




    private setAttributes(attributes?: Attributes): Attributes {
        const mutation = () => { return (Math.random() - 0.5) * 0.01 };
        if (attributes) {
            const newAttributes = {...this.attributes};
            const lifeLengthMutation = attributes.lifeLength + mutation();
            const jumpStrengthMutation = attributes.jumpStrength + mutation();
            const attackStrengthMutation = attributes.attackStrength + mutation();
            const attackCooldownMutation = attributes.attackCooldown + mutation();
            const maxHpMutation = attributes.maxHp + mutation();
            const maxEnergyMutation = attributes.maxEnergy + mutation();
            const visionRadiusMutation = attributes.visionRadius + mutation();

            return {
                lifeLength: lifeLengthMutation > 0 && lifeLengthMutation < 1 ? attributes.lifeLength + mutation() : attributes.lifeLength,
                jumpStrength: jumpStrengthMutation > 0 && jumpStrengthMutation < 1? attributes.jumpStrength + mutation() : attributes.jumpStrength,
                attackStrength: attackStrengthMutation > 0 && attackStrengthMutation < 1? attributes.attackStrength + mutation() : attributes.attackStrength,
                attackCooldown: attackCooldownMutation > 0 && attackCooldownMutation < 1? attributes.attackCooldown + mutation() : attributes.attackCooldown,
                maxHp: maxHpMutation > 0 && maxHpMutation < 1? attributes.maxHp + mutation() : attributes.maxHp,
                maxEnergy: maxEnergyMutation > 0 && maxEnergyMutation < 1? attributes.maxEnergy + mutation() : attributes.maxEnergy,
                visionRadius: visionRadiusMutation > 0 && visionRadiusMutation < 1? attributes.visionRadius + mutation() : attributes.visionRadius,

                enemyReactionVector: new THREE.Vector3(attributes.enemyReactionVector.x + mutation(), attributes.enemyReactionVector.y + mutation(), attributes.enemyReactionVector.z + mutation()),
                allyReactionVector: new THREE.Vector3(attributes.allyReactionVector.x + mutation(), attributes.allyReactionVector.y + mutation(), attributes.allyReactionVector.z + mutation()),
                foodReactionVector: new THREE.Vector3(attributes.foodReactionVector.x + mutation(), attributes.foodReactionVector.y + mutation(), attributes.foodReactionVector.z + mutation()),
                color: new THREE.Vector3(attributes.color.x + mutation(), attributes.color.y + mutation(), attributes.color.z + mutation())
            }
        } else {
            return {
                lifeLength: Math.random(),
                jumpStrength: Math.random(),
                attackStrength: Math.random(),
                attackCooldown: Math.random(),
                maxHp: Math.random(),
                maxEnergy: Math.random(),
                visionRadius: Math.random(),
                enemyReactionVector: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
                allyReactionVector: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
                foodReactionVector: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
                color: new THREE.Vector3(Math.random(), Math.random(), Math.random())
            }
        }
    }




    private jump() {
        this.energy -= this.jumpCost
        this.speed = this.groupedMeshes.position.clone().normalize().multiplyScalar(this.jumpStrength / 2);
        if (this.direction.length() > 0.01) {
            this.direction.normalize().multiplyScalar(this.jumpStrength);
            this.speed.x += this.direction.x;
            this.speed.y += this.direction.y;
            this.speed.z += this.direction.z;
        } else {
            this.speed.x += (Math.random() - 0.5) * this.jumpStrength;
            this.speed.y += (Math.random() - 0.5) * this.jumpStrength;
            this.speed.z += (Math.random() - 0.5) * this.jumpStrength;
        }
    }

    private zeroSpeed() {
        this.speed.multiplyScalar(0)
    }

    private accelerate(r: number, planetRadius: number, up?: boolean) {
        const G = 0.0005 * this.gravity;
        if (r > planetRadius + this.size / 2) {
            this.speed.addVectors(this.position.clone().normalize().multiplyScalar((up ? 1 : -1) * G / r * r), this.speed);
        } else if (r < planetRadius) {
            this.speed = this.position.clone().normalize().multiplyScalar(G * 10);
        }
    }

    move() {
        this.position.addVectors(this.position, this.speed)

    }

    private updateBaseAppearance(): void {
        if (this.groupedMeshes) {
            this.groupedMeshes?.scale.setScalar(this.size);
        }
    }

    private updateAppearance() {
        const speed = this.speed.length();
        let scaleZ = 0;
        let direction = this.speed.clone()

        //define desired appearance
        if (this.state === DudeState.DEAD) {
            scaleZ = Math.abs(2 * speed) + this.size / 10;
            this.direction = new THREE.Vector3(0, 0, 0)
            this.groupedMeshes.lookAt(direction)
        }
        else if (speed > 0) {
            scaleZ = Math.abs(1.5 * speed) + this.size;
            this.groupedMeshes.up = this.groupedMeshes.position.clone();

            direction = this.speed.clone().add(this.position)
            this.groupedMeshes.lookAt(direction)
        } else {

            scaleZ = Math.abs(2 * speed) + this.size;

        }

        this.groupedMeshes.scale.z = scaleZ;

        if (Math.random() > 0.98) {
            this.attackMesh.visible = false;
            this.defenseMesh.visible = false;
            this.lifeMesh.visible = false;
        }
    }

}