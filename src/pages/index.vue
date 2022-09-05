<script setup lang="ts">
import { Ref } from 'vue'
import ReadyStage from '~/components/gameUIStages/ReadyStage.vue'
import FocusStage from '~/components/gameUIStages/FocusStage.vue'
import RestStage from '~/components/gameUIStages/RestStage.vue'
import { createGame, MainScene } from '~/game'
import { useCountdownModel } from '~/models/countdownModel'

const game = ref() as Ref<ReturnType<typeof createGame>>
const getMainScene = () => game.value.scene.getScene('Game') as MainScene
const watch = async() => {
}

const {
  appstate,

} = useCountdownModel()

const stageComponent = computed(() => {
  if (appstate.value.isReadyState) return ReadyStage
  else if (appstate.value.isFocusState) return FocusStage
  else if (appstate.value.isRestState) return RestStage

  return ReadyStage
})

onMounted(() => {
  game.value = createGame()
})

const doWalking = () => {

}

</script>

<template>
  <div class="trip-pomodoro-content flex justify-center self-center relative w-[fit-content] mx-auto">
    <div id="trip-pomodoro-canvas-wrap">
    </div>
    <div class="stage-wrap absolute top-0 left-0 mr-auto w-full h-full">
      <button @click="doWalking">
        DoWalk
      </button>
      <component :is="stageComponent"></component>
    </div>
  </div>
</template>

<style lang="scss">

</style>

<route lang="yaml">
meta:
  layout: home
</route>
