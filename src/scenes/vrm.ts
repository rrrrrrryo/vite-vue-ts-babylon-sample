import { Engine, Scene, ArcRotateCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, SceneLoader, ShadowGenerator, DirectionalLight, Mesh, CubeTexture, Texture, ActionManager, ExecuteCodeAction, Action, Animation, ActionEvent, Quaternion, AnimationGroup } from "@babylonjs/core";
import '@babylonjs/inspector'
import '@babylonjs/gui'
import 'babylon-vrm-loader'
import { holistic_result } from "../script/script"
import { Holistic, Results } from "@mediapipe/holistic";

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
    onSmile: (flg: Boolean) => void,
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
        // if(holistic_result !== undefined){
        //     if(holistic_result.rightHandLandmarks !== undefined){
        //         onForward(speed);
        //         moveCount++;
        //     }
        // }
        if(holistic_result !== undefined){
            onSmile(judge_piece(holistic_result));
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

function judge_piece(holistic_result: Results){
    let flg:Boolean;
    flg = false;
    if (holistic_result.rightHandLandmarks !== undefined){
        const righthand = holistic_result.rightHandLandmarks
        let vec_indexfinger = new Vector3((righthand[8].x-righthand[5].x)*1280, (righthand[8].y-righthand[5].y)*720, (righthand[8].z-righthand[5].z)*1280);
        let vec_middlefinger = new Vector3((righthand[12].x-righthand[5].x)*1280, (righthand[12].y-righthand[5].y)*720, (righthand[12].z-righthand[5].z)*1280);
        console.log(Vector3.Dot(vec_indexfinger.normalize(), vec_middlefinger.normalize()))
        const deg = Math.acos(Vector3.Dot(vec_indexfinger.normalize(), vec_middlefinger.normalize()))*(180/Math.PI)
        console.log(deg);
        if (deg > 40){
            flg = true;
        }
    }
    return flg;
}

export { createskybox,  createActionManager, createAnimation, createWakAnimationGroup};