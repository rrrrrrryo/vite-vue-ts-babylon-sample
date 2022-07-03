import { Holistic, Results } from "@mediapipe/holistic";
import {Camera} from "@mediapipe/camera_utils";
import { drawresult } from "./mediapipe_utils";

import { Engine, Scene, ArcRotateCamera, Vector3, SceneLoader, ShadowGenerator, DirectionalLight, Mesh } from "@babylonjs/core";
import '@babylonjs/inspector'
import '@babylonjs/gui'
import 'babylon-vrm-loader'
import { createskybox, createWakAnimationGroup, createActionManager } from "../scenes/vrm"

export let holistic_result:Results;

const drawCanvas = (canvas:any, video:any) => {
    // const CanvasWidth = video.value.width;
    // const CanvasHeight = video.value.height;
    const CanvasWidth = 1280;
    const CanvasHeight = 720;
    canvas.width = CanvasWidth;
    canvas.height = CanvasHeight;

    // const CanvasWidth = canvas.width;
    // const CanvasHeight = canvas.height;
    const Canvas = canvas;
    const Video = video;
    const canvasCtx = Canvas.value.getContext('2d');

    function onResults(results:any) {
        holistic_result = results;
        drawresult(results, canvasCtx, CanvasWidth, CanvasHeight);
      }

    const holistic = new Holistic({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }});
    holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: false,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    })
    holistic.onResults(onResults);

    const camera = new Camera(Video.value, {
        onFrame: async () => {
            await holistic.send({image: Video.value});
        },
        width: 1280,
        height: 720
    });
    camera.start();
}


// const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const createScene = (canvas: any) => {

    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI /2, 10, Vector3.Zero(), scene, true);
    camera.panningSensibility = 0;
    camera.wheelPrecision = 10;
    camera.upperBetaLimit = Math.PI / 2.0;
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 10;
    camera.minZ = 0.5;
    camera.maxZ = 1000;
    camera.attachControl(canvas, true);

    // new HemisphericLight('Light', Vector3.Up(), scene);
    const light = new DirectionalLight('Ligit', new Vector3(0,-100,80), scene);
    light.intensity = 1.0;
    const shadowGenerator = new ShadowGenerator(1024, light);

    // const box = MeshBuilder.CreateBox('box', { size: 2 }, scene);
    // const vrm = SceneLoader.Append("../src/assets/","AliciaSolid.vrm", scene);
    const vrm = SceneLoader.ImportMeshAsync("","/","AliciaSolid.vrm")
    .then((result) =>{
        scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);
        const vrmManager = scene.metadata.vrmManagers[0];

        // morphing -> 表情
        vrmManager.morphing('Joy', 1.0);
        const vrmMesh = vrmManager.rootMesh as Mesh;
        camera.setTarget(vrmMesh);
        shadowGenerator.addShadowCaster(vrmMesh);

        scene.onBeforeRenderObservable.add(() => {
            vrmManager.update(scene.getEngine().getDeltaTime());
            camera.setTarget(new Vector3(vrmMesh.position.x, vrmMesh.position.y+1, vrmMesh.position.z));
        });
        const walkAnimation = createWakAnimationGroup(vrmManager, scene);
        createActionManager(
            scene,
            // forward
            (delta) => {
                walkAnimation.start(true, 1, 0, 60);
                vrmMesh.movePOV(0, 0, -delta/1300)
            },
            // backward
            (delta) => {
                walkAnimation.start(true, 1, 0, 60);
                vrmMesh.movePOV(0, 0, delta/2200)
            },
            // Left Rotation
            (delta) => {
                walkAnimation.start(true, 1, 0, 60);
                vrmMesh.rotate(Vector3.Up(), -delta/1000)
            },
            // Right Rotation
            (delta) => {
                walkAnimation.start(true, 1, 0, 60);
                vrmMesh.rotate(Vector3.Up(), delta/1000)
            },
            // smile
            (flg) => {
                if(flg){
                    vrmManager.morphing("Joy", 1.0)
                }
                else{
                    vrmManager.morphing("Joy", 0.0)
                }
            },
            () => {
                walkAnimation.stop();
                walkAnimation.reset();
            },
        );
    });
    const house = SceneLoader.ImportMeshAsync("", "https://assets.babylonjs.com/meshes/", "both_houses_scene.babylon")
    .then((result) => {
        let ground = result.meshes[0];
        let house1 = result.meshes[1];
        let house2 = result.meshes[2];
        ground.scaling = new Vector3(2, 1, 2)
        house1.scaling = new Vector3(0.5, 0.5, 0.5);
        house2.scaling = new Vector3(0.5, 0.5, 0.5);
    });
    createskybox(scene);

    engine.runRenderLoop(() => {
        scene.render();
    });
    window.addEventListener("resize", function () {
        engine.resize();
    });
    // scene.debugLayer.show();
};

export {drawCanvas, createScene};