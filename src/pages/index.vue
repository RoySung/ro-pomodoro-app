<script setup lang="ts">
import { Ref } from 'vue'
import ReadyStage from '~/components/gameUIStages/ReadyStage.vue'
import FocusStage from '~/components/gameUIStages/FocusStage.vue'
import RestStage from '~/components/gameUIStages/RestStage.vue'
import { createGame, MainScene } from '~/game'
import { eventsCenter as gameEventCenter, Events as GameEvent } from '~/game/eventsCenter'
import { useCountdownModel, Events } from '~/models/countdownModel'

const game = ref() as Ref<ReturnType<typeof createGame>>
const getMainScene = () => game.value.scene.getScene('Game') as MainScene
const watch = async() => {
}

const {
  appstate,
  emitter,
} = useCountdownModel()

emitter.on(Events.StartFocus, () => {
  gameEventCenter.emit(GameEvent.Walk)
})

emitter.on(Events.StartRest, () => {
  gameEventCenter.emit(GameEvent.StartRest)
})

emitter.on(Events.FinishRest, () => {
  gameEventCenter.emit(GameEvent.FinishRest)
})

const stageComponent = computed(() => {
  if (appstate.value.isReadyState) return ReadyStage
  else if (appstate.value.isFocusState) return FocusStage
  else if (appstate.value.isRestState) return RestStage

  return ReadyStage
})

onMounted(() => {
  game.value = createGame()
})

</script>

<template>
  <div class="trip-pomodoro-content flex justify-center self-center relative w-[fit-content] mx-auto">
    <div id="trip-pomodoro-canvas-wrap">
    </div>
    <div class="stage-wrap absolute top-0 left-0 mr-auto w-full h-full">
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
