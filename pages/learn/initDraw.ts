export default function initDraw(canvas: HTMLCanvasElement | null) {
    console.log(canvas);
    if (canvas) {
        canvas.style.touchAction = "none";
        canvas.style.background = `no-repeat center url(${canvas.dataset.url})`;
        let ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
        var pressedMouse = false;
        var x: number, y: number;

        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", drawLine);
        canvas.addEventListener("mouseup", stopDrawing);
        canvas.addEventListener("pointerdown", startDrawing);
        canvas.addEventListener("pointermove", drawLine);
        canvas.addEventListener("pointerup", stopDrawing);

        function startDrawing(eventvs01: MouseEvent) {
            pressedMouse = true;
            x = eventvs01.offsetX;
            y = eventvs01.offsetY;
        }

        function drawLine(eventvs02: MouseEvent) {
            if (pressedMouse) {
                if (canvas) canvas.style.cursor = "crosshair";
                var xM = eventvs02.offsetX;
                var yM = eventvs02.offsetY;
                drawing_line(x, y, xM, yM);
                x = xM;
                y = yM;
            }
        }

        function stopDrawing(eventvs03: MouseEvent) {
            pressedMouse = false;
            if (canvas) canvas.style.cursor = "default";
        }

        function clearCanvas() {
            if (canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function drawing_line(xs: number, ys: number, xe: number, ye: number) {
            ctx.beginPath();
            ctx.strokeStyle = "#7aa8e6"
            ctx.lineWidth = 4;
            ctx.moveTo(xs, ys);
            ctx.lineTo(xe, ye);
            ctx.stroke();
            ctx.closePath();
        }
    }
}