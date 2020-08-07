import '../styles/main.scss';
import {getCanvas, getContext, resizeCanvas} from './helpers';
import WorkerVertex from './vertex-data.worker';
import WorkerColor from './color-data.worker';

function app() {
    resizeCanvas();
    const canvas = getCanvas();
    const gl = getContext(canvas);
    const statusValueElement = document.querySelector('.status .value');
    const columnsValueElement = document.querySelector('.columns .value');
    const rowsValueElement = document.querySelector('.rows .value');
    const totalValueElement = document.querySelector('.elements .value');
    const fpsValueElement = document.querySelector('.fps .value');
    const scaleValueElement = document.querySelector('.scale .value');
    const translateXValueElement = document.querySelector('.translate-x .value');
    const translateYValueElement = document.querySelector('.translate-y .value');

    // Set the number of columns here. The square size will be calculated to fit this number
    // of columns into the viewport. The number of rows will be calculated depending on the
    // viewport height.
    const numberOfColumns = 1000;
    // The space between the squares to the square size ratio.
    const squareToGutterRatio = 0.2;
    const numberOfRows = Math.floor(canvas.height / canvas.width * numberOfColumns);
    const numberOfElements = numberOfRows * numberOfColumns;

    statusValueElement.textContent = 'Generating data...'
    columnsValueElement.textContent = String(numberOfColumns);
    rowsValueElement.textContent = String(numberOfRows);
    totalValueElement.textContent = String(numberOfElements);

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
    colorWorker.postMessage(numberOfElements);

    Promise.all([vertexPromise, colorPromise]).then(values => {
        statusValueElement.textContent = 'Preparing shaders...'

        const [vertices, colors] = values;

        // Vertex shader
        const vertexSource = `
            attribute vec2 coordinates;
            attribute vec3 color;
            uniform vec4 translation;
            uniform mat4 transform;
            varying vec3 vertexColor;
            void main(void) {
                // Convert from the application's coordinate system (from top left to bottom right)
                // to the GL one.
                vec2 toGlSpace = vec2(coordinates[0], 1.0 - coordinates[1]) * 2.0 - 1.0;
                gl_Position = (vec4(toGlSpace , 0.0, 1.0) + translation) * transform;
                vertexColor = color;
            }`;
        const vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, vertexSource);
        gl.compileShader(vertShader);

        //Fragment shader
        const fragmentSource = `
            precision mediump float;
            varying vec3 vertexColor;
            void main(void) {
                gl_FragColor = vec4(vertexColor, 1.0);
            }`;
        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, fragmentSource);
        gl.compileShader(fragShader);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader);
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        const coordinatesLocation = gl.getAttribLocation(shaderProgram, 'coordinates');
        gl.vertexAttribPointer(coordinatesLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coordinatesLocation);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        const colorLocation = gl.getAttribLocation(shaderProgram, 'color');
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLocation);

        const translate = [0.0, 0.0, 0.0, 0.0];
        const translateLocation = gl.getUniformLocation(shaderProgram, 'translation');
        gl.uniform4fv(translateLocation, translate);

        const transform = [
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ].flat();
        const transformLocation = gl.getUniformLocation(shaderProgram, 'transform');
        gl.uniformMatrix4fv(transformLocation, false, transform);

        let renderCounter = 0;
        let lastTime = Date.now();

        function render() {
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.clear(gl.COLOR_BUFFER_BIT);

            const count = Date.now() / 1000;

            // Translating.
            translate[0] = Math.sin(count) / 20;
            translate[1] = Math.cos(count) / 20;
            gl.uniform4fv(translateLocation, translate);
            translateXValueElement.textContent = String(translate[0].toFixed(2));
            translateYValueElement.textContent = String(translate[1].toFixed(2));

            // Zooming in and out
            transform[0] = transform[5] = transform[10] = 0.9 + (Math.sin(count/2) + 1) * 5;
            scaleValueElement.textContent = String(transform[0].toFixed(2));
            gl.uniformMatrix4fv(transformLocation, false, transform);

            gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);

            renderCounter++;
            const now = Date.now();
            const diff = now - lastTime
            if(diff > 1000) {
                lastTime = now;
                fpsValueElement.textContent = String(Math.round(renderCounter / (diff / 1000)));
                renderCounter = 0;
            }

            requestAnimationFrame(render);
        }

        statusValueElement.textContent = 'Rendering'

        requestAnimationFrame(render);
    });

}

window.onresize = resizeCanvas;
window.onload = app;
