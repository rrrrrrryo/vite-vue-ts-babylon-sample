import { Engine, Scene, ArcRotateCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight } from "@babylonjs/core";
// const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const createScene = (canvas: any) => {
    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI /2, 10, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    new HemisphericLight('Ligit', Vector3.Up(), scene);

    const box = MeshBuilder.CreateBox('box', { size: 2 }, scene);
    const material = new StandardMaterial('box-material', scene);
    material.diffuseColor = Color3.Blue();
    box.material = material;

    engine.runRenderLoop(() => {
        scene.render();
    });
};

export { createScene };