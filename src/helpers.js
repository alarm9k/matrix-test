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

export function getRectVertices(topLeftX, topLeftY, width, height) {
    return [
        // First triangle
        [topLeftX, topLeftY],
        [topLeftX, topLeftY + height],
        [topLeftX + width, topLeftY + height],

        // Second triangle
        [topLeftX, topLeftY],
        [topLeftX + width, topLeftY],
        [topLeftX + width, topLeftY + height]
    ].flat();
}

export function getVertexData(canvas, numberOfColumns, squareToGutterRatio) {
    const numberOfRows = Math.floor(canvas.height / canvas.width * numberOfColumns);

    // We consider the viewport coordinates to be from 0 to 1, going from top left to bottom right.
    const rectWidth = 1 / (numberOfColumns + squareToGutterRatio * (numberOfColumns - 1));
    const horizontalGutter = rectWidth * squareToGutterRatio;
    const squareWithGutterWidth = rectWidth + horizontalGutter;

    // Adjust the rectangle height to appear as squares regardless of the aspect ratio.
    const rectHeight = 1 / (numberOfRows + squareToGutterRatio * (numberOfRows - 1));
    const verticalGutter = rectHeight * squareToGutterRatio;
    const squareWithGutterHeight = rectHeight + verticalGutter;

    let vertices = [];

    for(let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
        for(let columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {
            const topLeftX = columnIndex * squareWithGutterWidth;
            const topLeftY = rowIndex * squareWithGutterHeight;
            const rect = getRectVertices(topLeftX, topLeftY, rectWidth, rectHeight);
            vertices.push(...rect);
        }
    }

    return [vertices, numberOfRows];
}

export function getColorData(numberOfRectangles) {
    let colors = [];

    for(let elementIndex = 0; elementIndex < numberOfRectangles; elementIndex++) {
        const randomColor = [Math.random(), Math.random(), Math.random()];
        // 6 vertices per rectangle, 3 color values per vertex.
        const rectColors = Array(6);
        rectColors.fill(randomColor)
        colors.push(...rectColors.flat());
    }

    return colors;
}
