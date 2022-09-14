<script setup lang="ts">
import { Ref } from 'vue'
import { delay } from 'lodash-es'
import IconSettings from 'virtual:vite-icons/ic/baseline-settings'
import ReadyStage from '~/components/gameUIStages/ReadyStage.vue'
import FocusStage from '~/components/gameUIStages/FocusStage.vue'
import RestStage from '~/components/gameUIStages/RestStage.vue'
import StatusWindow from '~/components/gameUIStages/widgets/StatusWindow.vue'
import RButton from '~/components/Button.vue'
import { createGame, MainScene, Game } from '~/game'
import { eventsCenter as gameEventCenter, Events as GameEvent } from '~/game/eventsCenter'
import { useCountdownModel, Events } from '~/models/countdownModel'
import SettingsWindow from '~/components/gameUIStages/widgets/SettingsWindow.vue'

const game = ref() as Ref<Game>
const getMainScene = () => game.value.scene.getScene('Game') as MainScene
const watch = async() => {
}

const isShowSettings = ref(false)
const toggleSettings = () => isShowSettings.value = !isShowSettings.value

const {
  appState,
  emitter,
  finishCycle,
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
  delay(() => emitter.emit(Events.FinishCycle), 5000)
})

emitter.on(Events.FinishCycle, () => {
  finishCycle()
})

const stageComponent = computed(() => {
  const { isReadyState, isFocusState, isRestState, isFinishState } = appState.value
  if (isReadyState) return ReadyStage
  else if (isFocusState) return FocusStage
  else if (isRestState) return RestStage
  else if (isFinishState) return () => {}
})

onMounted(async() => {
  const newGame = await createGame()
  game.value = newGame
  const { isFocusState, isRestState, isFinishState } = appState.value
  if (isFocusState) emitter.emit(Events.StartFocus)
  else if (isRestState) emitter.emit(Events.StartRest)
  else if (isFinishState) emitter.emit(Events.FinishCycle)
})

</script>

<template>
  <div class="trip-pomodoro-content flex justify-center self-center relative w-[fit-content] mx-auto">
    <div id="trip-pomodoro-canvas-wrap">
    </div>
    <div class="stage-wrap absolute top-0 left-0 mr-auto w-full h-full">
      <component :is="stageComponent"></component>
      <StatusWindow class="absolute top-0 left-0 w-full text-black"></StatusWindow>
      <r-button
        class="!absolute bottom-[7px] right-[2px] text-gray-700 w-[50px] h-[50px]"
        @click="toggleSettings"
      >
        <IconSettings style="font-size: 1.5rem;" />
      </r-button>
      <SettingsWindow v-model:isShow="isShowSettings" class="absolute top-0 left-0 w-full h-full" />
    </div>
  </div>
</template>

<style lang="scss">

</style>

<route lang="yaml">
meta:
  layout: home
</route>
