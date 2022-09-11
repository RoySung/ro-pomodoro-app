<template>
  <div class="mvp-widget flex  items-center">
    <img class="h-[60px] aspect-auto" :src="iconImg" alt="">
    <span class="mx-1 text-white">x</span>
    <span class="text-white" v-text="count"></span>
  </div>
</template>

<script lang="ts" setup>
import MvpIconImg from '/game/items/mvp-icon.png'

const iconImg = MvpIconImg

const { count } = defineProps({
  count: {
    type: Number,
    default: 0,
  },
})
console.log(count)

</script>

<style lang="scss" scoped>

</style>
