import '../styles/main.scss';

function getCanvas() {
    const canvas = document.querySelector('.viewport');
    if (canvas) {
        return canvas;
    }
}

function getContext(canvas) {
    if(canvas) {
        return canvas.getContext('webgl');
    }
}

function resizeCanvas() {
    const canvas = getCanvas();
    if(canvas) {
        const clientWidth = canvas.clientWidth;
        const clientHeight = canvas.clientHeight;

        if(clientWidth !== canvas.width) {
            canvas.width = clientWidth;
        }

        if(clientHeight !== canvas.height) {
            canvas.height = clientHeight;
        }

        const gl = getContext(canvas);
        gl.viewport(0, 0, clientWidth, clientHeight);
    }
}

function getSquareVertices(topLeftX, topLeftY, size) {
    return [
        // First triangle
        [topLeftX, topLeftY],
        [topLeftX, topLeftY + size],
        [topLeftX + size, topLeftY + size],

        // Second triangle
        [topLeftX, topLeftY],
        [topLeftX + size, topLeftY],
        [topLeftX + size, topLeftY + size]
    ].flat();
}

function getVertexData(canvas, numberOfColumns, squareToGutterRatio) {
    const numberOfRows = Math.floor(canvas.height / canvas.width * numberOfColumns);
    // We consider the viewport coordinates to be from 0 to 1, going from top left to bottom right.
    const squareSize = 1 / (numberOfColumns + squareToGutterRatio * (numberOfColumns - 1));
    const gutterSize = squareSize * squareToGutterRatio;
    const squareWithGutter = squareSize + gutterSize;
    let vertices = [];

    for(let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
        for(let columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {
            const topLeftX = columnIndex * squareWithGutter;
            const topLeftY = rowIndex * squareWithGutter;
            const square = getSquareVertices(topLeftX, topLeftY, squareSize);
            vertices = vertices.concat(square);
        }
    }

    return vertices;
}

function render() {
    resizeCanvas();
    const canvas = getCanvas();
    const gl = getContext(canvas);

    const numberOfColumns = 100;
    // The space between the squares to the square size ratio.
    const squareToGutterRatio = 0.2;

    const vertices = getVertexData(canvas, numberOfColumns, squareToGutterRatio);

    // Vertex shader
    const vertCode = `
        attribute vec2 coordinates;
        uniform vec4 translation;
        uniform mat4 transform;
        void main(void) { 
            vec2 toGlSpace = vec2(coordinates[0], 1.0 - coordinates[1]) * 2.0 - 1.0;
            gl_Position = (vec4(toGlSpace , 0.0, 1.0) + translation) * transform;
        }
    `;
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    //Fragment shader
    const fragCode = `
        precision mediump float;
        void main(void) {
            gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
        }`;
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
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

    function render() {
        /* Step5: Drawing the required object (triangle) */
        // Clear the canvas
        gl.clearColor(1.0, 1.0, 1.0, 1.0);

        // Enable the depth test
        gl.enable(gl.DEPTH_TEST);

        // Clear the color buffer bit
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw the triangle
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
    }

    render();
}

window.onresize = resizeCanvas;
window.onload = render;
