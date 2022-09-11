<script lang="ts" setup>
import { useCountdownModel } from '~/models/countdownModel'

const {
  countDownTimeStr,
  isOverTime,
  stopFocus,
  finishFocus,
} = useCountdownModel()

</script>
<template>
  <div>
    Focus Stage
    <br>
    <h1>{{ countDownTimeStr }}</h1>
    <br><br><br><br><br>
    <button v-if="!isOverTime" :onclick="stopFocus">
      Stop Focus
    </button>
    <button v-else :onclick="finishFocus">
      Finish Focus
    </button>
  </div>
</template>

<style lang="scss" scoped>

</style>
