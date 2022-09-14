<template>
  <button class="r-button relative" @click="handleClick">
    <div class="relative pointer-events-none flex justify-center">
      <slot></slot>
    </div>
  </button>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'

const props = defineProps({
  onClick: Function as PropType<(e: MouseEvent) => void>,
})

const handleClick = (e: MouseEvent): void => {
  const { onClick } = props
  if (onClick) onClick(e)
}
</script>

<style lang="scss" scoped>
  .r-button  {
    @apply bg-white p-1 border-[#ababab] border-solid border-2 rounded-[8px] overflow-hidden;
    border-bottom: 1px #6b6b6b solid;
    box-shadow: 0px 1px 1px #6b6b6b;
    &:before {
      content: "";
      display: block;
      pointer-events: none;
      position:absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.5;
      background: linear-gradient(
        #c3c2c2 5%,
        #dddddd 20%,
        #f7f7f7 25%,
        #dddddd 30%,
        #f7f7f7 40%,
        #fcfcfc 45%,
        #f7f7f7 60%,
        transparent 97%,
        #6b6b6b 3%)
    }
    &:hover {
      box-shadow: 0px 0px 1px #6b6b6b;
      background: #dddddd;
    }
    &:focus {
      outline: none;
    }
  }

</style>
