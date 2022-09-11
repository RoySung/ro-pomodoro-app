<script lang="ts" setup>
import { useCountdownModel } from '~/models/countdownModel'

const {
  countDownTimeStr,
  isOverTime,
  finishRest,
  stopRest,
} = useCountdownModel()

</script>
<template>
  <div>
    Rest Stage
    <br>
    <h1>{{ countDownTimeStr }}</h1>
    <br><br><br><br><br><br>
    <button v-if="isOverTime" :onclick="finishRest">
      Finish Rest
    </button>
    <button v-else :onclick="stopRest">
      Stop Rest
    </button>
  </div>
</template>

<style lang="scss" scoped>

</style>
