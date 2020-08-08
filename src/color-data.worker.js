function getColorData(numberOfRectangles) {
    let colors = [];

    for(let elementIndex = 0; elementIndex < numberOfRectangles; elementIndex++) {
        const randomColor = [Math.random(), Math.random(), Math.random()];
        // 6 vertices per rectangle, 3 color values per vertex.
        const rectColors = Array(6);
        rectColors.fill(randomColor)
        colors.push(...rectColors.flat());
    }

    return new Float32Array(colors);
}

onmessage = function(event) {
    const numberOfRectangles = event.data;
    postMessage(getColorData(numberOfRectangles));
}
