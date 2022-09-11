<script setup lang="ts">
import { emit } from 'process'
import { Ref } from 'vue'
import ReadyStage from '~/components/gameUIStages/ReadyStage.vue'
import FocusStage from '~/components/gameUIStages/FocusStage.vue'
import RestStage from '~/components/gameUIStages/RestStage.vue'
import StatusWindow from '~/components/gameUIStages/widgets/StatusWindow.vue'
import { createGame, MainScene, Game } from '~/game'
import { eventsCenter as gameEventCenter, Events as GameEvent } from '~/game/eventsCenter'
import { useCountdownModel, Events } from '~/models/countdownModel'

const game = ref() as Ref<Game>
const getMainScene = () => game.value.scene.getScene('Game') as MainScene
const watch = async() => {
}

const {
  appState,
  emitter,
} = useCountdownModel()

emitter.on(Events.StartFocus, () => {
  gameEventCenter.emit(GameEvent.Walk)
})

emitter.on(Events.StopFocus, () => {
  gameEventCenter.emit(GameEvent.Idle)
})

emitter.on(Events.StartRest, () => {
  gameEventCenter.emit(GameEvent.StartRest)
})

emitter.on(Events.FinishRest, () => {
  gameEventCenter.emit(GameEvent.FinishRest)
})

const stageComponent = computed(() => {
  const { isReadyState, isFocusState, isRestState } = appState.value
  if (isReadyState) return ReadyStage
  else if (isFocusState) return FocusStage
  else if (isRestState) return RestStage

  return ReadyStage
})

onMounted(async() => {
  const newGame = await createGame()
  game.value = newGame
  const { isFocusState, isRestState } = appState.value
  if (isFocusState) emitter.emit(Events.StartFocus)
  else if (isRestState) emitter.emit(Events.StartRest)
})

</script>

<template>
  <div class="trip-pomodoro-content flex justify-center self-center relative w-[fit-content] mx-auto">
    <div id="trip-pomodoro-canvas-wrap">
    </div>
    <div class="stage-wrap absolute top-0 left-0 mr-auto w-full h-full">
      <component :is="stageComponent"></component>
      <StatusWindow></StatusWindow>
    </div>
  </div>
</template>

<style lang="scss">

</style>

<route lang="yaml">
meta:
  layout: home
</route>
