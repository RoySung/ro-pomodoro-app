<script setup lang="ts">
import { Ref } from 'vue'
import { delay } from 'lodash-es'
import IconSettings from 'virtual:vite-icons/ic/baseline-settings'
import { useMotions } from '@vueuse/motion'
import ReadyStage from '~/components/gameUIStages/ReadyStage.vue'
import FocusStage from '~/components/gameUIStages/FocusStage.vue'
import RestStage from '~/components/gameUIStages/RestStage.vue'
import StatusWindow from '~/components/gameUIStages/widgets/StatusWindow.vue'
import RButton from '~/components/Button.vue'
import { createGame, MainScene, Game } from '~/game'
import { eventsCenter as gameEventCenter, Events as GameEvent } from '~/game/eventsCenter'
import { useCountdownModel, Events } from '~/models/countdownModel'
import SettingsWindow from '~/components/gameUIStages/widgets/SettingsWindow.vue'

const motions = useMotions()

const isLoaded = ref(false)
const progressPercent = ref(0)
const progressPercentText = computed(() => `"${progressPercent.value * 100}%"`)
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
  const onProgress = (value: number) => {
    progressPercent.value = value
    if (value === 1) delay(() => isLoaded.value = true, 1000)
  }

  const onComplete = () => {
    const { isFocusState, isRestState, isFinishState } = appState.value
    if (isFocusState) emitter.emit(Events.StartFocus)
    else if (isRestState) emitter.emit(Events.StartRest)
    else if (isFinishState) emitter.emit(Events.FinishCycle)
  }

  const newGame = createGame(onProgress, onComplete)
  game.value = newGame
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
    <transition
      :css="false"
      @leave="(el, done) => motions['barrier'].leave(done)"
    >
      <div
        v-if="!isLoaded"
        v-motion="'barrier'"
        :initial="{
          opacity: 1,
          scale: 1,
        }"
        :leave="{
          opacity: 0,
          scale: 3,
          transition: {
            scale: {
              duration: 500,
              delay: 100,
            },
            duration: 500,
            ease: 'easeOut',
          },
        }"
        class="trip-pomodoro-content__barrier absolute h-full w-full bg-black flex justify-center items-center"
      >
        <div class="progress-bar"></div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss">
  .progress-bar {
    width: 80%;
    height: 30px;
    background: gray;
    position: relative;
    &:before {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      background: white;
      width: calc(v-bind(progressPercent)*100%);
      height: 100%;
      transition: width 0.8s ease-out;
    }
    &:after {
      @apply text-white;
      content: v-bind(progressPercentText);
      display: block;
      position: absolute;
      top: 30px;
      left: 0;
    }
  }

</style>
