import { Results, POSE_CONNECTIONS, FACEMESH_TESSELATION, HAND_CONNECTIONS , FACEMESH_LEFT_EYE, FACEMESH_RIGHT_EYE, FACEMESH_RIGHT_EYEBROW, FACEMESH_LEFT_EYEBROW, FACEMESH_FACE_OVAL, FACEMESH_LIPS } from "@mediapipe/holistic";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

// import { canvasCtx, CanvasWidth, CanvasHeight } from "./script";

function removeElements(
    landmarks: any, elements: number[]) {
  for (const element of elements) {
    delete landmarks[element];
  }
}

function removeLandmarks(results: Results) {
    if (results.poseLandmarks) {
      removeElements(
          results.poseLandmarks,
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22]);
    }
}

function drawresult(results:Results, canvasCtx:CanvasRenderingContext2D, CanvasWidth:number, CanvasHeight:number) {
    // console.log(results);
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, CanvasWidth, CanvasHeight);
    // canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
  
    // Only overwrite existing pixels.
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#00FF00';
    canvasCtx.fillRect(0, 0, CanvasWidth, CanvasHeight);
  
    removeLandmarks(results);

    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(results.image, 0, 0, CanvasWidth, CanvasHeight);
  
    // canvasCtx.globalCompositeOperation = 'source-over';
    // drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
    //                {color: '#00FF00', lineWidth: 4});
    // drawLandmarks(canvasCtx, results.poseLandmarks,
    //               {color: '#FF0000', lineWidth: 2});
    // drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
    //                {color: '#C0C0C070', lineWidth: 1});
    // drawConnectors(
    //     canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYE,
    //     {color: 'rgb(0,217,231)'});
    // drawConnectors(
    //     canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYEBROW,
    //     {color: 'rgb(0,217,231)'});
    // drawConnectors(
    //     canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYE,
    //     {color: 'rgb(255,138,0)'});
    // drawConnectors(
    //     canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYEBROW,
    //     {color: 'rgb(255,138,0)'});
    // drawConnectors(
    //     canvasCtx, results.faceLandmarks, FACEMESH_FACE_OVAL,
    //     {color: '#E0E0E0', lineWidth: 5});
    // drawConnectors(
    //     canvasCtx, results.faceLandmarks, FACEMESH_LIPS,
    //     {color: '#E0E0E0', lineWidth: 5});
              
    // drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
    //                {color: '#CC0000', lineWidth: 5});
    // drawLandmarks(canvasCtx, results.leftHandLandmarks,
    //               {color: '#00FF00', lineWidth: 2});
    // drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
    //                {color: '#00CC00', lineWidth: 5});
    // drawLandmarks(canvasCtx, results.rightHandLandmarks,
    //               {color: '#FF0000', lineWidth: 2});
    
    canvasCtx.restore();
  }

export { removeLandmarks, drawresult };