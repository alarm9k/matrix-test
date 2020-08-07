import WorkerVertex from './vertex-data.worker';
import WorkerColor from './color-data.worker';

export function generateData(numberOfColumns, numberOfRows, squareToGutterRatio) {
    const vertexWorker = new WorkerVertex();
    const vertexPromise = new Promise(resolve => {
        vertexWorker.onmessage = event => {
            resolve(event.data);
        }
    })
    vertexWorker.postMessage({
        numberOfColumns,
        numberOfRows,
        squareToGutterRatio
    });

    const colorWorker = new WorkerColor();
    const colorPromise = new Promise(resolve => {
        colorWorker.onmessage = event => {
            resolve(event.data);
        }
    })
    colorWorker.postMessage(numberOfRows * numberOfColumns);

    return Promise.all([vertexPromise, colorPromise]);
}
