
import Engine from './Engine/engine.ts'

const experience = new Engine(document.querySelector('canvas.webgl'))


const dudeInfo = document.getElementById('dudeInfo')
const infoBox = document.getElementById('infoBox')
const restartBox = document.getElementById('restartBox')
const showRestartBox = document.getElementById('showRestartBox')
const restartAction = document.getElementById('restartAction')
const orbitAction = document.getElementById('orbitAction')
const closeInfoAction = document.getElementById('closeInfoAction')
const closeRestartAction = document.getElementById('closeRestartAction')
const basicInfo = document.getElementById('basicInfo')

const noOrganismsInput = document.getElementById('noOrganismsInput')
const noRocksInput = document.getElementById('noRocksInput')
const planetSizeInput = document.getElementById('planetSizeInput')
const gravityInput = document.getElementById('gravityInput')

const noOrganismsValue = document.getElementById('noOrganismsValue')
const noRocksValue = document.getElementById('noRocksValue')
const planetSizeValue = document.getElementById('planetSizeValue')
const gravityValue = document.getElementById('gravityValue')

let isOrbiting = false;

// infoBox.style.display = 'none';

restartBox.style.display = 'none';


orbitAction.addEventListener('click', () => {
    experience.toggleOrbit()
    isOrbiting = !isOrbiting
    orbitAction.innerText = isOrbiting ? 'Stop orbiting' : 'Start orbiting'
})

closeInfoAction.addEventListener('click', () => {
    basicInfo.style.display = 'none';
})

closeRestartAction.addEventListener('click', () => {
    restartBox.style.display = 'none';
})

showRestartBox.addEventListener('click', () => {
    restartBox.style.display = 'block';
})

noOrganismsInput.addEventListener('change', () => {
    noOrganismsValue.innerText = noOrganismsInput.value;
})
noRocksInput.addEventListener('change', () => {
    noRocksValue.innerText = noRocksInput.value;
})
planetSizeInput.addEventListener('change', () => {
    planetSizeValue.innerText = planetSizeInput.value;
})
gravityInput.addEventListener('change', () => {
    gravityValue.innerText = gravityInput.value;
})

restartAction.addEventListener('click', () => {
    experience.resetSimulation(noOrganismsInput.value,noRocksInput.value,planetSizeInput.value,gravityInput.value)
})




// fill info-box element with experience data

const info = [

    // Time related
    {
        name: 'FPS',
        value: 0
    },
    {
        name: 'Time',
        value: 0
    },

    // Simulation related
    {
        name: 'Simulation size',
        value: 0
    },

    // break
    {
        name: ' --- ',
        value: 0
    },


    // Dude related
    {
        name: 'Name',
        value: 0
    },
    {
        name: 'Health',
        value: 0
    },
    {
        name: 'Energy',
        value: 0
    },
    {
        name: 'Jump Cost',
        value: 0
    },
    {
        name: 'Attack Strength',
        value: 0
    }
]

const createDiv = (name, value) => {
    var newDiv = document.createElement('div');
    newDiv.textContent = `${name}: ${typeof value == "string" ? value : Math.floor(value)}`; // You can set any property or child elements here
    dudeInfo.appendChild(newDiv);
}

function toUppercase(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

setInterval(() => {
    const parameters = experience.getDudeParameters();
    const time = experience.getTime();
    const simulationInfo = experience.getSimulationInfo();




    dudeInfo.innerHTML = '';

    info[0].value = time.currentFPS
    info[1].value = time.elapsed / 1000;
    // info[2].value = simulationInfo.numberOfDudes;
    if (parameters.name) {
        info[3].value = "---"
        info[4].value = toUppercase(parameters.name);
        info[5].value = parameters.hp ? Math.floor(parameters.hp) + ' / ' + Math.floor(parameters.maxHp) : '';
        info[6].value = parameters.energy ? Math.floor(parameters.energy) + ' / ' + Math.floor(parameters.maxEnergy) : '';
        info[7].value = parameters.jumpCost;
        info[8].value = parameters.attackStrength;
    } else {
        info[3].value = '';
        info[4].value = '';
        info[5].value = '';
        info[6].value = '';
        info[7].value = '';
        info[8].value = '';
    }

    info.forEach((info) => {
        if (info.value) {
            createDiv(info.name, info.value);
        }
    })
}, 300)
