import EventEmitter from './event-emitter'

export default class Time extends EventEmitter {
    start: number;
    current: number;
    elapsed: number;
    delta: number;
    currentFPS: number;
    updateTrigger: number;
    updateLoad = 0
    constructor() {
        super()

        // Setup
        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
        this.delta = 16
        this.currentFPS = 0
        this.updateTrigger = 16

        window.requestAnimationFrame(() => {
            this.tick()
        })
    }

    tick() {
        const currentTime = Date.now()
        this.delta = currentTime - this.current
        this.current = currentTime
        this.elapsed = this.current - this.start
        this.currentFPS = Math.round(1000 / this.delta)
        this.updateLoad += this.delta
        this.trigger('tick')
        if (this.updateLoad > this.updateTrigger) {
            this.updateLoad = 0;
            this.trigger('logicTick')
        }

        window.requestAnimationFrame(() => {
            this.tick();
        })
        // setTimeout(() => {this.tick()},1) 
    }
}