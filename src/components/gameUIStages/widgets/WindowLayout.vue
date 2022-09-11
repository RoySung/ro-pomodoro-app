<template>
  <div class="window">
    <div class="window__top-bar">
      <button class="window-ball-btn">
      </button>
      <span class="relative flex pl-2 text-xs leading-5 text-black">RoySung</span>
      <button class="window-ball-btn ml-auto">
      </button>
    </div>
    <div class="window__content">
      <slot name="content"></slot>
    </div>
    <div class="window__status-wrap p-1">
      <slot name="status"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>

.window {
  @apply  absolute top-0 left-0 w-full text-black;
  border-radius: 3px;
  &__top-bar {
    @apply  flex items-center;
    position: relative;
    height: 25px;
    background-color: blue;;
    padding: 4px;
    background: repeating-linear-gradient(
      #cbd7f9,
      #b4c4ed 10%,
    );
    border: #818aaa 1px solid;
    border-bottom: #060f11 1px solid;
    border-radius: 3px 3px 0px 0px;
    overflow: hidden;
    &:before {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(#fff, #a4b3dd, #fff);
      opacity: 0.6;
    }
  }
  &__content {
    @apply p-3;
    background: repeating-linear-gradient(
      #f9fdf9,
      #f0f3f0 10%,
    );
    border: #818aaa 1px solid;
    border-top: 0;
    border-radius: 0px 0px 3px 3px;
  }
}

.window-ball-btn{
  position: relative;
  height: 80%;
  aspect-ratio: 1;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: radial-gradient(circle at 50% 15%, #eeffff -15%, #6f85c1, #303e6c);
  &:after {
    content: "";
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: radial-gradient(circle at 50% 85%, #eeffff -15%,#6f85c1, transparent);
  }
}
</style>
