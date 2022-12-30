<template>
  <WindowLayout :title="userName">
    <template #content>
      <div class="flex items-center text-size-xs min-h-[42px] p-2">
        <span v-if="!appState.isRestState">Focus Time.</span>
        <span v-else>Rest Time.</span>
        <span class="ml-1" v-text="timeStr"></span>
        <button v-if="isShowStopBtn" class="stop-btn" @click="stopAction">
          <IconPauseFilled style="font-size: 1.8em; pointer-events: none;" />
        </button>
      </div>
    </template>
    <template #status>
      <MvpWidget :count="recordsCount" />
    </template>
  </WindowLayout>
</template>

<script lang="ts" setup>
import IconPauseFilled from 'virtual:vite-icons/carbon/pause-filled'
import WindowLayout from '~/components/gameUIStages/widgets/WindowLayout.vue'
import { useCountdownModel } from '~/models/countdownModel'
import { useSettingsModel } from '~/models/settingsModel'

const {
  appState,
  recordsCount,
  countDownTimeStr,
  durationTimeStr,
  isOverTime,
  stopFocus,
  stopRest,
} = useCountdownModel()

const { userName } = useSettingsModel()

const isShowStopBtn = computed(() => !isOverTime.value && (appState.value.isFocusState || appState.value.isRestState))
const timeStr = computed(() => `${countDownTimeStr.value}/${durationTimeStr.value}`)
const stopAction = computed(() => {
  const { isFocusState, isRestState } = appState.value
  if (isFocusState) return () => stopFocus()
  else if (isRestState) return () => stopRest()
})

</script>

<style lang="scss" scoped>
.stop-btn {
  @apply  ml-3  flex justify-center items-center h-[25px] w-[25px] p-[0px] rounded-full;
  background: radial-gradient(circle at 55% 33%, #eeffff 15%, #dadeda 45%, #8c938c)
}
</style>
