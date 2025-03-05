import * as THREE from 'three'



export class NameGenerator {

    static nameArray = [
        "ki",
        "cić",
        "mu",
        "buć",
        "mi",
        "na",
        "fi",
        "fka",
        "u",
        "la",
        "kaw",
        "ka",
        "psi",
        "czka"

    ]

    static generateName(nameVector: THREE.Vector3): string {
        return this.nameArray[Math.floor(nameVector.x * this.nameArray.length)] + this.nameArray[Math.floor(nameVector.y * this.nameArray.length)] + this.nameArray[Math.floor(nameVector.z * this.nameArray.length)];  
    }
}