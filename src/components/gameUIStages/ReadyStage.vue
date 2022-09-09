<script lang="ts" setup>
import { useCountdownModel } from '~/models/countdownModel'

const {
  startFocus,
} = useCountdownModel()

</script>
<template>
  <div>
    Ready Stage
    <br><br><br>
    <button
      type="button"
      class="nes-btn"
      :onclick="startFocus"
    >
      Start Focus
    </button>
  </div>
</template>

<style lang="scss" scoped>

</style>
