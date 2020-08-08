function getRectVertices(topLeftX, topLeftY, width, height) {
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

function getVertexData(numberOfColumns, numberOfRows, squareToGutterRatio) {
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

    return new Float32Array(vertices);
}

onmessage = function(event) {
    const {numberOfColumns, numberOfRows, squareToGutterRatio} = event.data;
    postMessage(getVertexData(numberOfColumns, numberOfRows, squareToGutterRatio));
}
