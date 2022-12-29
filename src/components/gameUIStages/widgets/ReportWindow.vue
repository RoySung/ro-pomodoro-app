<template>
  <div class="report-window overflow-hidden text-black">
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
              <div class="today-counter text-center">
                <h3 class="border-b-1 border-gray-500">
                  Today
                </h3>
                {{ currentRecordsByToday.length }}
              </div>
              <div class="week-counter  text-center">
                <h3 class="border-b-1 border-gray-500">
                  Week
                </h3>
                {{ currentRecordsByWeek.length }}
              </div>
              <div class="month-counter  text-center">
                <h3 class="border-b-1 border-gray-500">
                  Month
                </h3>
                {{ currentRecordsByMonth.length }}
              </div>
            </div>
            <hr>
            <div class="week-chart-section p-2">
              <h3>Week Chart</h3>
              <div class="week-chart-context flex items-center">
                <r-button class="w-[50px] h-[30px] m-1" @click="changeToLastWeek">
                  <ArrowBackIcon class="transform scale-200" style="font-size: 1rem;"></ArrowBackIcon>
                </r-button>
                <div class="chart-wrap w-[80%]">
                  <Bar :data="chartData" :options="chartOptions"></Bar>
                </div>
                <r-button class="w-[50px] h-[30px] m-1" @click="changeToNextWeek">
                  <ArrowForwardIcon class="transform scale-200" style="font-size: 1rem;"></ArrowForwardIcon>
                </r-button>
              </div>
            </div>
          </div>
        </template>
      </WindowLayout>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ChartOptions,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import ArrowBackIcon from 'virtual:vite-icons/ic/round-arrow-back-ios'
import ArrowForwardIcon from 'virtual:vite-icons/ic/round-arrow-forward-ios'
import { useMotions } from '@vueuse/motion'
import RButton from '~/components/Button.vue'
import { useCountdownModel } from '~/models/countdownModel'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const {
  firstDay,
  recordsByWeek,
  currentRecordsByToday,
  currentRecordsByWeek,
  currentRecordsByMonth,
  groupRecordsByDay,
  changeToLastWeek,
  changeToNextWeek,
} = useCountdownModel()

let delayed = false
const chartOptions = computed<ChartOptions>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      onComplete: () => {
        delayed = true
      },
      delay: (context) => {
        let delay = 0
        if (context.type === 'data' && context.mode === 'default' && !delayed)
          delay = context.dataIndex * 300 + context.datasetIndex * 100

        return delay
      },
      duration: 1500,
    },
    plugins: {
      title: {
        display: true,
        text: `Total: ${recordsByWeek.value.length}`,
      },
    },
  }
})

const getChartData = (labels: string[], data: number[]) => {
  return {
    labels,
    datasets: [
      {
        label: 'count',
        backgroundColor: '#fa988f',
        data,
      },
    ],
  }
}

const chartData = computed(() => {
  const recordsByDay = groupRecordsByDay(recordsByWeek.value)
  const countArr = Object.values(recordsByDay).map(records => records.length)
  let labels = [
    'MO',
    'TU',
    'WE',
    'TH',
    'FR',
    'SA',
    'SU',
  ]
  labels = labels.map((_, index) => {
    return firstDay.value.day(index + 1).format('MM/DD')
  })
  return getChartData(labels, countArr)
})

const motions = useMotions()
defineProps({
  isShow: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(['update:isShow'])
const closeWindow = () => emit('update:isShow', false)
</script>

<style lang="scss" scoped>
.report-window{}
</style>
