<template>
    <canvas id="renderCanvas" ref="bjsCanvas"/>
</template>

<script setup lang="ts">
import { ref, onMounted } from '@vue/runtime-core';
import { createScene} from '../scenes/VRMtest';

const name = 'BabylonScene';
const bjsCanvas = ref(null);
onMounted(() => {
    if (bjsCanvas.value) {
        createScene(bjsCanvas.value);
    };
    return {
        bjsCanvas,
    };
});

</script>

<style type="text/css">
    body {
        margin : 0;
        padding: 0;
        /* width: 100vw; */
        /* height: 100vh; */
        width: 100%;
        height: 100%;
    }
    #renderCanvas {

        margin: 0;
        padding: 0;
        width: 960px;
        height: 540px;
        /* width: 100%; */
        /* height: 100%; */
    }
</style>