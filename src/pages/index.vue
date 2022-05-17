<script setup lang="ts">
import { createGame, MainScene } from '~/game'

const game = ref()
const getMainScene = () => game.value.scene.getScene('Game') as MainScene
const watch = async() => {
}

onMounted(() => {
  game.value = createGame()
})

</script>

<template>
  <div id="flappy-bird-game" class="flex justify-center self-center">
  </div>
</template>

<style lang="scss">

</style>

<route lang="yaml">
meta:
  layout: home
</route>
