<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const Game = import.meta.env.SSR ? () => {} : defineAsyncComponent(() => import('~/components/Game.vue'))

</script>

<template>
  <client-only>
    <Game />
  </client-only>
</template>

<style lang="scss">

</style>

<route lang="yaml">
meta:
  layout: home
</route>
