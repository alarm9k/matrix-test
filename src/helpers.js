export function getCanvas() {
    const canvas = document.querySelector('.viewport');
    if (canvas) {
        return canvas;
    }
}

export function getContext(canvas) {
    if(canvas) {
        return canvas.getContext('webgl');
    }
}

export function resizeCanvas() {
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

export function getSquareVertices(topLeftX, topLeftY, size) {
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

export function getVertexData(canvas, numberOfColumns, squareToGutterRatio) {
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

    return [vertices, numberOfRows];
}
