import '../styles/main.scss';
import {getCanvas, getContext, resizeCanvas} from './helpers';
import {generateData} from './generate-data';

function app() {
    resizeCanvas();
    const canvas = getCanvas();
    const gl = getContext(canvas);

    const infoEntries = {
        status: document.querySelector('.status .value'),
        columns: document.querySelector('.columns .value'),
        rows: document.querySelector('.rows .value'),
        total: document.querySelector('.elements .value'),
        fps: document.querySelector('.fps .value'),
        scale: document.querySelector('.scale .value'),
        translateX: document.querySelector('.translate-x .value'),
        translateY: document.querySelector('.translate-y .value')
    };

    function updateInfo(newValues) {
        Object.keys(newValues).forEach(key => infoEntries[key].textContent = newValues[key]);
    }

    // Set the number of columns here. The square size will be calculated to fit this number
    // of columns into the viewport. The number of rows will be calculated depending on the
    // viewport height.
    const numberOfColumns = 1000;
    // The space between the squares to the square size ratio.
    const squareToGutterRatio = 0.2;
    const numberOfRows = Math.floor(canvas.height / canvas.width * numberOfColumns);
    const numberOfElements = numberOfRows * numberOfColumns;

    updateInfo({
        status: 'Generating data...',
        columns: String(numberOfColumns),
        rows: String(numberOfRows),
        total: String(numberOfElements)
    });


    generateData(numberOfColumns, numberOfRows, squareToGutterRatio)
        .then(values => {
            {
                updateInfo({status: 'Preparing shaders...'});

                const [vertices, colors] = values;

                // Vertex shader
                const vertexSource = `
                    attribute vec2 coordinates;
                    attribute vec3 color;
                    uniform mat4 transform;
                    varying vec3 vertexColor;
                    void main(void) {
                        // Convert from the application's coordinate system (from top left to bottom right)
                        // to the GL one.
                        vec2 toGlSpace = vec2(coordinates[0], 1.0 - coordinates[1]) * 2.0 - 1.0;
                        gl_Position = vec4(toGlSpace , 0.0, 1.0) * transform;
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
                gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                const coordinatesLocation = gl.getAttribLocation(shaderProgram, 'coordinates');
                gl.vertexAttribPointer(coordinatesLocation, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(coordinatesLocation);

                const colorBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
                const colorLocation = gl.getAttribLocation(shaderProgram, 'color');
                gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(colorLocation);

                const transform = [
                    [1.0, 0.0, 0.0, 0.0],
                    [0.0, 1.0, 0.0, 0.0],
                    [0.0, 0.0, 1.0, 0.0],
                    [0.0, 0.0, 0.0, 1.0]
                ].flat();
                const transformLocation = gl.getUniformLocation(shaderProgram, 'transform');
                gl.uniformMatrix4fv(transformLocation, false, transform);

                let renderCount = 0;
                let lastTime = Date.now();

                function render() {
                    gl.clearColor(1.0, 1.0, 1.0, 1.0);
                    gl.enable(gl.DEPTH_TEST);
                    gl.clear(gl.COLOR_BUFFER_BIT);

                    const count = Date.now() / 1000;

                    // Translating.
                    transform[3] = Math.sin(count) / 5;
                    transform[7] = Math.cos(count) / 5;
                    // Zooming in and out
                    transform[0] = transform[5] = 0.9 + (Math.sin(count / 2) + 1) * 5;

                    updateInfo({
                        translateX: String(transform[3].toFixed(2)),
                        translateY: String(transform[7].toFixed(2)),
                        scale: String(transform[0].toFixed(2))
                    });
                    gl.uniformMatrix4fv(transformLocation, false, transform);

                    gl.drawArrays(gl.TRIANGLES, 0, numberOfElements * 6);

                    // Calculate FPS.
                    renderCount++;
                    const now = Date.now();
                    const diff = now - lastTime;
                    if (diff > 1000) {
                        lastTime = now;
                        updateInfo({fps: String(Math.round(renderCount / (diff / 1000)))});
                        renderCount = 0;
                    }

                    requestAnimationFrame(render);
                }

                updateInfo({status: 'Rendering'});

                requestAnimationFrame(render);
            }
        });

}

window.onresize = resizeCanvas;
window.onload = app;
