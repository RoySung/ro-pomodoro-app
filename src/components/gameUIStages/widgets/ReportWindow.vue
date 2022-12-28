<template>
  <div v-if="isShow" class="report-window overflow-hidden text-black">
    <div class="absolute top-0 left-0  barrier w-full h-full bg-gray-400 opacity-60" @click="closeWindow"></div>
    <transition
      :css="false"
      @leave="(el, done) => motions['report-window'].leave(done)"
    >
      <WindowLayout
        ref="windowRef"
        v-motion="'settings-window'"
        :initial="{
          opacity: 0,
          scale: 0,
        }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: {
            duration: 200,
            ease: 'easeInOut',
          },
        }"
        :leave="{
          opacity: 0,
          scale: 0,
        }"
        class="w-4/5 absolute top-[20%] left-[10%]"
        title="Report"
      >
        <template #content>
          <div class="report-content p-2">
            <div class="counters-section flex justify-between p-2">
              <div class="today-counter">
                <p class="border-b-1 border-gray-500">
                  Today
                </p>
                {{ currentRecordsByToday.length }}
              </div>
              <div class="week-counter">
                <p class="border-b-1 border-gray-500">
                  Week
                </p>
                {{ currentRecordsByWeek.length }}
              </div>
              <div class="month-counter">
                <p class="border-b-1 border-gray-500">
                  Month
                </p>
                {{ currentRecordsByMonth.length }}
              </div>
            </div>
            <hr>
            <div class="week-chart-section">
            </div>
          </div>
        </template>
      </WindowLayout>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { useMotions } from '@vueuse/motion'
import { useCountdownModel } from '~/models/countdownModel'

const {
  currentRecordsByToday,
  currentRecordsByWeek,
  currentRecordsByMonth,
} = useCountdownModel()

const motions = useMotions()
defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:isShow'])
const closeWindow = () => emit('update:isShow', false)
</script>

<style lang="scss" scoped>
.report-window{}
</style>
