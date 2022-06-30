import "@mediapipe/holistic";
import "@mediapipe/camera_utils";
import "@mediapipe/control_utils";

let video: any;
let canvas: any;

const setvaliables = (c: any, v: any) => {
    video = v
    canvas = c
}

const drawCanvas = () => {
    if (canvas.value === undefined || video.value === undefined){
        return;
    }
    const context: CanvasRenderingContext2D | null = canvas.value.getContext('2d');
    if(context === null){
        return;
    }
    context.drawImage(
        video.value,
        0,
        0,
        960,
        540,
    )
    requestAnimationFrame(drawCanvas);
}

export {drawCanvas, setvaliables}