<template>
  <WindowLayout v-if="isShow" title="Actions" class="text-black text-sm">
    <template #content>
      <div>
        <r-button class="w-4/5" @click="action">
          {{ actionText }}
        </r-button>
      </div>
    </template>
  </WindowLayout>
</template>

<script lang="ts" setup>
import RButton from '~/components/Button.vue'
import { useCountdownModel } from '~/models/countdownModel'
const {
  isOverTime,
  appState,
  startFocus,
  startRest,
  finishRest,
} = useCountdownModel()

const isShow = computed(() => {
  return isOverTime.value || appState.value.isReadyState
})

const action = () => {
  const { isReadyState, isFocusState, isRestState } = appState.value
  if (isReadyState) return startFocus()
  else if (isFocusState) return startRest()
  else if (isRestState) return finishRest()
}
const actionText = computed(() => {
  const { isReadyState, isFocusState, isRestState } = appState.value
  if (isReadyState) return 'Start Focus'
  else if (isFocusState) return 'Start Rest'
  else if (isRestState) return 'Finish'
})

</script>

<style lang="scss" scoped>

</style>
