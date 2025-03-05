export class PerformanceTest {
    static checkProcessorSpeed(): number {
        const results = [];

        for (let j = 0; j < 5; ++j) {

            const start = Date.now()
    
            for (let i = 0; i < 1e7; ++i) {
                Math.sqrt(i) + i;
                Math.pow(2, 3) + i;
                Math.log(5 + i);
                Math.cos(10 * i) + Math.sin(10 * i);
                Math.atan(i / 1e7);
                Math.sqrt(i / 1e7) + i;
            }
    
            const end = Date.now()
            results.push(end - start);
        }

        return results.reduce((a, b) => a + b) / results.length;

    }
}