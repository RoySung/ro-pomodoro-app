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
        class="w-4/5 absolute top-[15%] left-[10%]"
        title="Report"
      >
        <template #content>
          <div class="report-content p-2 max-h-[520px] overflow-scroll">
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
            <div class="week-chart-section p-2 text-center">
              <h3>Week Chart</h3>
              <div class="week-chart-context flex items-center">
                <r-button class="w-[50px] h-[30px] m-1" @click="changeToLastWeek">
                  <ArrowBackIcon class="transform scale-200" style="font-size: 1rem;"></ArrowBackIcon>
                </r-button>
                <div class="chart-wrap w-[80%] h-[180px]">
                  <Bar :data="weekChartData" :options="weekChartOptions"></Bar>
                </div>
                <r-button class="w-[50px] h-[30px] m-1" @click="changeToNextWeek">
                  <ArrowForwardIcon class="transform scale-200" style="font-size: 1rem;"></ArrowForwardIcon>
                </r-button>
              </div>
            </div>
            <div class="months-chart-section p-2 text-center">
              <h3>Months Chart</h3>
              <div class="months-chart-context flex items-center">
                <r-button class="w-[50px] h-[30px] m-1" @click="changeToLastYear">
                  <ArrowBackIcon class="transform scale-200" style="font-size: 1rem;"></ArrowBackIcon>
                </r-button>
                <div class="chart-wrap w-[80%] h-[360px]">
                  <Bar :data="monthsChartData" :options="monthsChartOptions"></Bar>
                </div>
                <r-button class="w-[50px] h-[30px] m-1" @click="changeToNextYear">
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
  // eslint-disable-next-line import/named
  ChartOptions,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import ArrowBackIcon from 'virtual:vite-icons/ic/round-arrow-back-ios'
import ArrowForwardIcon from 'virtual:vite-icons/ic/round-arrow-forward-ios'
import { useMotions } from '@vueuse/motion'
import RButton from '~/components/Button.vue'
import { useCountdownModel } from '~/models/countdownModel'

const motions = useMotions()

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const {
  weekFirstDay,
  yearFirstDay,
  recordsInWeek,
  recordsInYear,
  currentRecordsByToday,
  currentRecordsByWeek,
  currentRecordsByMonth,
  groupRecordsByDay,
  groupRecordsByMonth,
  changeToLastWeek,
  changeToNextWeek,
  changeToLastYear,
  changeToNextYear,
} = useCountdownModel()

const delayed = {
  week: false,
  months: false,
}
const weekChartOptions = computed<ChartOptions>(() => {
  const dateRangeStr = `${weekFirstDay.value.format('YYYY/MM/DD')}-${weekFirstDay.value.day(7).format('MM/DD')}`
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      onComplete: () => {
        delayed.week = true
      },
      delay: (context) => {
        let delay = 0
        if (context.type === 'data' && context.mode === 'default' && !delayed.week)
          delay = context.dataIndex * 300 + context.datasetIndex * 100

        return delay
      },
      duration: 1500,
    },
    plugins: {
      title: {
        display: true,
        text: `${dateRangeStr} Total: ${recordsInWeek.value.length}`,
      },
    },
  }
})
const monthsChartOptions = computed<ChartOptions>(() => {
  return {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      onComplete: () => {
        delayed.months = true
      },
      delay: (context) => {
        let delay = 0
        if (context.type === 'data' && context.mode === 'default' && !delayed.months)
          delay = context.dataIndex * 300 + context.datasetIndex * 100

        return delay
      },
      duration: 1500,
    },
    plugins: {
      title: {
        display: true,
        text: `${yearFirstDay.value.format('YYYY')} Total: ${recordsInYear.value.length}`,
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

const weekChartData = computed(() => {
  const recordsByDay = groupRecordsByDay(recordsInWeek.value)
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
    return weekFirstDay.value.day(index + 1).format('MM/DD')
  })
  const countArr = labels.map((_, index) => {
    const dateStr = weekFirstDay.value.day(index + 1).format('YYYY/MM/DD')

    return recordsByDay[dateStr]?.length || 0
  })
  return getChartData(labels, countArr)
})

const monthsChartData = computed(() => {
  const recordsGroupByMonth = groupRecordsByMonth(recordsInYear.value)
  const labels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const countArr = labels.map((_, index) => {
    const year = yearFirstDay.value.year()
    const month = yearFirstDay.value.month(index).format('MM')
    const monthStr = `${year}/${month}`

    return recordsGroupByMonth[monthStr]?.length || 0
  })

  return getChartData(labels, countArr)
})

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
