import Dude, { DudeState } from "./dude";
import Rock from "./rock";

export class PhysicsModule {

    static hashList = new Map();

    static hashDudes(dudes: Dude[] | Rock[], t: number): void {
        if (!dudes || dudes.length === 0) {
            return;
        }

        this.hashList = new Map();

        dudes.forEach((dude: Dude | Rock, i: number) => {
            const hashName = this.getEntityHash(dude, t);
            const hash = this.hashList.get(hashName);

            if (hash) {
                PhysicsModule.hashList.set(hashName, hash.concat(i))
            } else {
                PhysicsModule.hashList.set(hashName, [i])
            }
        })
    }

    static getEntityHash(dude: Dude | Rock, t: number): string {
        const xp = Math.floor(dude.position.x / t);
        const yp = Math.floor(dude.position.y / t);
        const zp = Math.floor(dude.position.z / t);

        return JSON.stringify({ x: xp, y: yp, z: zp })
    }

    static getNearHashes(hash: string): string[] {
        const nearHashes = []
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                for (let k = -1; k < 2; k++) {
                    let hashVector = JSON.parse(hash)
                    nearHashes.push(JSON.stringify({ x: hashVector.x + i, y: hashVector.y + j, z: hashVector.z + k }))
                }
            }
        }
        return nearHashes
    }

    static checkInteractions(dudes: Dude[] | Rock[], t: number) {
        dudes.forEach((d1) => {
            if (d1.state === DudeState.ROCK) {
                return;
            }
            const eHash = this.getEntityHash(d1, t);
            const nearHash = this.getNearHashes(eHash).concat([eHash]);

            let indexes: number[] = [];


            nearHash.forEach((hashKey: string) => {
                const hash = this.hashList.get(hashKey);
                if (hash && hash.length !== 0) {
                    indexes = indexes.concat(hash);
                }
            });

            indexes = [...new Set(indexes)];
            indexes.forEach((i: number) => {
                if (d1 === dudes[i] || !dudes[i]) {
                    return;
                }
                this.checkCollision(d1 as Dude, dudes[i] as Dude)
                this.checkVision(d1 as Dude, dudes[i] as Dude);


            });
        });
    }

    static checkCollision(d1: Dude, d2: Dude): boolean {
        if (d1.position.distanceTo(d2.position) < d1.size + d2.size) {
            if (d1.state == DudeState.DEAD) {
                if (d2.state === DudeState.ROCK || d2.state === DudeState.DEAD) {
                    const conectionVector = d1.position.clone().sub(d2.position).multiplyScalar(0.005);
                    d1.speed = conectionVector;
                    d1.move();
                }
            } else {
                if (d2.state === DudeState.ROCK) {
                    this.outtaWay(d1, d2);
                } else if (d2.state === DudeState.DEAD) {
                    if (d1.energy > d1.maxEnergy / 3 && d1.attributes.color.distanceTo(d2.attributes.color) > 0.05) {
                        d2.updateAttributes(d1.attributes)
                        d2.setState(DudeState.ALIVE)
                        d1.giveLife();
                    }
                    
                } else {
                    this.outtaWay(d1, d2);
                    if (d1.attributes.color.distanceTo(d2.attributes.color) > 0.01) {
                        // attack
                        if (d1.energy > d1.attackCost && d1.attackTime > d1.attackCooldown) {
                            d2.takeDamage(d1.performAttack());
                        } else {
                            
                        }
                    }
                }
            }
            return true;
        }
        return false;
    }

    static checkVision(d1: Dude, d2: Dude) {
        const newDirection = d1.position.clone().subVectors(d1.position, d2.position).normalize().multiplyScalar(1 / d1.visionRadius);
        if (d1.position.distanceTo(d2.position) < d1.visionRadius) {
            if (d2.state === DudeState.DEAD) {
                if (d1.attributes.color.distanceTo(d2.attributes.color) > d1.enemyReactionVector.x) {
                    d1.direction.add(newDirection).multiplyScalar(d1.foodReactionVector.x);
                } else {
                    d1.direction.add(newDirection).multiplyScalar(d1.foodReactionVector.y);
                }
            } else if (d2.state === DudeState.ROCK) {
                d1.direction.add(newDirection.multiplyScalar(d1.foodReactionVector.z));
            } else if (d1.attributes.color.distanceTo(d2.attributes.color) > d1.enemyReactionVector.x) {
                if (d1.hp > d1.maxHp * 0.9 && d1.energy > d1.maxEnergy * 0.8) {
                    d1.direction.add(newDirection.multiplyScalar(d1.enemyReactionVector.y));
                } else {
                    d1.direction.add(newDirection.multiplyScalar(d1.enemyReactionVector.z));
                }
            } else {

                if (d1.position.distanceTo(d2.position) < d1.allyReactionVector.x) {
                    d1.direction.add(newDirection).multiplyScalar(d1.allyReactionVector.y);
                } else {
                    d1.direction.add(newDirection.multiplyScalar(d1.allyReactionVector.z));
                }
            }

        } else {
            return false;
        }
    }

    static outtaWay(d1: Dude, d2: Dude) {

        const conectionVector = d1.position.clone().sub(d2.position).multiplyScalar(0.01);
        d1.speed.multiplyScalar(0.9)
        d1.speed.add(conectionVector);

    }

}