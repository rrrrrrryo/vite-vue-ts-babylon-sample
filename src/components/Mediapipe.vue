<template>
    <BabylonScene/>
    <video id="input_video" ref="video" width=1280 height=720></video>
    <div id="CanvasContainer">
        <canvas id="mediapipeCanvas" ref="canvas" width=1280 height=720></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "@vue/runtime-core";
import { drawCanvas } from "../script/script"
import "./BabylonScene.vue"
import BabylonScene from "./BabylonScene.vue";
const name = "mediapipe caputure";
const video = ref<HTMLVideoElement>();
const canvas = ref<HTMLCanvasElement>();
onMounted(() => {
    drawCanvas(canvas, video);
});

</script>

<style type="text/css">
    #input_video{
        /* margin: 0; */
        /* padding: 0; */
        /* width: 100%;
        height: 100%; */
        width: 0%;
        height: 0%;

    }
    #mediapipeCanvas{
        transform: scale(-1, 1);
        width: 100%;
        height: 100%;
    }
    #CanvasContainer{
        width: 50%;
        height: 50%;
        align-self: flex-end;
    }
</style>