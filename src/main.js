import '../styles/main.scss';
import {getCanvas, getContext, getVertexData, resizeCanvas} from './helpers';

function render() {
    resizeCanvas();
    const canvas = getCanvas();
    const gl = getContext(canvas);
    const columnsValueElement = document.querySelector('.columns .value');
    const rowsValueElement = document.querySelector('.rows .value');
    const totalValueElement = document.querySelector('.elements .value');
    const fpsValueElement = document.querySelector('.fps .value');

    const numberOfColumns = 100;
    // The space between the squares to the square size ratio.
    const squareToGutterRatio = 0.2;

    const [vertices, numberOfRows] = getVertexData(canvas, numberOfColumns, squareToGutterRatio);

    columnsValueElement.textContent = String(numberOfColumns);
    rowsValueElement.textContent = String(numberOfRows);
    totalValueElement.textContent = String(numberOfRows * numberOfColumns);

    // Vertex shader
    const vertexSource = `
        attribute vec2 coordinates;
        uniform vec4 translation;
        uniform mat4 transform;
        void main(void) { 
            // Convert from the application's coordinate system (from top left to bottom right)
            // to the GL one.
            vec2 toGlSpace = vec2(coordinates[0], 1.0 - coordinates[1]) * 2.0 - 1.0;
            gl_Position = (vec4(toGlSpace , 0.0, 1.0) + translation) * transform;
        }
    `;
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertexSource);
    gl.compileShader(vertShader);

    //Fragment shader
    const fragmentSource = `
        precision mediump float;
        void main(void) {
            gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
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
        translate[0] = Math.sin(count) / 20;
        translate[1] = Math.cos(count) / 20;
        gl.uniform4fv(translateLocation, translate);

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

    requestAnimationFrame(render);
}

window.onresize = resizeCanvas;
window.onload = render;
