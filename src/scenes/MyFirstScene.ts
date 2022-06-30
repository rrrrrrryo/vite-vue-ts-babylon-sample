import { Engine, Scene, ArcRotateCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, SceneLoader, ShadowGenerator, DirectionalLight, Mesh, CubeTexture, Texture, ActionManager, ExecuteCodeAction, Action, Animation, ActionEvent, Quaternion, AnimationGroup } from "@babylonjs/core";
import 'babylon-vrm-loader'

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
    const vrm = SceneLoader.ImportMeshAsync("","../src/assets/","AliciaSolid.vrm")
    .then((result) =>{
        const vrmManager = scene.metadata.vrmManagers[0];
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
            (delta) => {
                walkAnimation.start(true, 1, 0, 60);
                vrmMesh.movePOV(0, 0, delta/1300)
            },
            (delta) => {
                walkAnimation.start(true, 1, 0, 60);
                vrmMesh.movePOV(0, 0, -delta/2200)
            },
            (delta) => {
                walkAnimation.start(true, 1, 0, 60);
                vrmMesh.rotate(Vector3.Up(), -delta/1000)
            },
            (delta) => {
                walkAnimation.start(true, 1, 0, 60);
                vrmMesh.rotate(Vector3.Up(), delta/1000)
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

    // const material = new StandardMaterial('box-material', scene);
    // material.diffuseColor = Color3.Blue();
    // box.material = material;

    engine.runRenderLoop(() => {
        scene.render();
    });
};

function createskybox(scene: Scene) {
    const skybox = MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
    const skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture("https://assets.babylonjs.com/textures/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0,0,0);
    skyboxMaterial.specularColor = new Color3(0,0,0);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;

    return skybox;
}

function createActionManager(
    scene: Scene, 
    onForward: (delta: number) => void, 
    onBackward: (delta: number) => void, 
    onLeft: (delta: number) => void, 
    onRight: (delta: number) => void, 
    onStop: () => void)
{
    interface inputMap {
        65: Boolean;
        83: Boolean;
        68: Boolean;
        87: Boolean;
    }
    const inputKeyMap = {
        65: false, // A
        83: false, // S
        68: false, // D
        87: false, // W
    } as inputMap;
    scene.actionManager = new ActionManager(scene);
    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function(evnt):void {
        const key: keyof inputMap = evnt.sourceEvent.keyCode;
        inputKeyMap[key] = evnt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function(evnt){
        const key: keyof inputMap = evnt.sourceEvent.keyCode;
        inputKeyMap[key] = evnt.sourceEvent.type == "keydown";        
    }));
    scene.onBeforeRenderObservable.add(() => {
        const speed = scene.getEngine().getDeltaTime();
        let moveCount = 0;
        if(inputKeyMap[65]){
            onLeft(speed);
            moveCount++;
        }
        if(inputKeyMap[83]){
            onBackward(speed);
            moveCount++;
        }
        if(inputKeyMap[68]){
            onRight(speed);
            moveCount++;
        }
        if(inputKeyMap[87]){
            onForward(speed);
            moveCount++;
        }
        if(moveCount == 0){
            onStop();
        }
    });
}

function createAnimation(animation: any) {
    const anim = new Animation(animation.name, 'rotationQuaternion', 60, Animation.ANIMATIONTYPE_QUATERNION, Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys: any[] = [];
    for (const key of animation.keys){
        keys.push({
            frame: key[0],
            value: Quaternion.RotationYawPitchRoll(key[1], key[2], key[3])
        });
    }
    anim.setKeys(keys);

    return anim;
}

function createWakAnimationGroup(vrmManager: any, scene:Scene): AnimationGroup {
    const leftUpperLegAnim = {
        name: 'leftUpperLegAnim',
        keys: [
            [0, 0, 0, 0],
            [15, 0, Math.PI/10, 0],
            [45, 0, -Math.PI/15, 0],
            [60, 0, 0, 0],
        ],
    };
    
    const rightUpperLegAnim = {
        name: 'rightUpperLegAnim',
        keys: [
            [0, 0, 0, 0],
            [15, 0, -Math.PI/10, 0],
            [45, 0, Math.PI/15, 0],
            [60, 0, 0, 0],
        ],
    };

    const leftUpperArmAnim = {
        name: 'leftUpperArmAnime',
        keys: [
            [0,  0, 0, Math.PI/2.5],
            [15, 0, -Math.PI/6, Math.PI/2.5],
            [45, 0, Math.PI/4, Math.PI/2.5],
            [60, 0, 0, Math.PI/2.5],
        ],
    };

    const rightUpperArmAnim = {
        name: 'rightUpperArmAnim',
        keys: [
            [0,  0, 0, -Math.PI/2.5],
            [15, 0, Math.PI/6, -Math.PI/2.5],
            [45, 0, -Math.PI/4, -Math.PI/2.5],
            [60, 0, 0, -Math.PI/2.5],
        ],
    };

    const anigroup = new AnimationGroup('Walk', scene);
    anigroup.loopAnimation = true;
    anigroup.addTargetedAnimation(createAnimation(leftUpperLegAnim),vrmManager.humanoidBone.leftUpperLeg);
    anigroup.addTargetedAnimation(createAnimation(rightUpperLegAnim),vrmManager.humanoidBone.rightUpperLeg);
    anigroup.addTargetedAnimation(createAnimation(leftUpperArmAnim),vrmManager.humanoidBone.leftUpperArm);
    anigroup.addTargetedAnimation(createAnimation(rightUpperArmAnim),vrmManager.humanoidBone.rightUpperArm);

    return anigroup
}

export { createScene };