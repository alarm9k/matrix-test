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
