import { padStart, cloneDeep } from 'lodash-es'
import mitt from 'mitt'
import { useSettingsModel } from '~/models/settingsModel'
import { ms2sec } from '~/utils/time'

interface AppState {
  name: string
  isFocusState?: boolean
  isReadyState?: boolean
  isRestState?: boolean
  isFinishState?: boolean
}

interface Record {
  focus: {
    startTime: string
    endTime: string
  }
  rest: {
    startTime: string
    endTime: string
  }
}

export enum Events {
  StartFocus = 'start-focus',
  StopFocus = 'stop-focus',
  FinishFocus = 'finish-focus',
  StartRest = 'start-rest',
  FinishRest = 'finish-rest',
  FinishCycle = 'finish-cycle'
}

const { focusDurationMS, restDurationMS } = useSettingsModel()

const emitter = mitt()

const focusState: AppState = {
  name: 'Focus State',
  isFocusState: true,
}
const readyState: AppState = {
  name: 'Ready State',
  isReadyState: true,
}

const restState: AppState = {
  name: 'Rest State',
  isRestState: true,
}
const finishState: AppState = {
  name: 'Finish State',
  isFinishState: true,
}

const defaultRecord: Record = {
  focus: {
    startTime: '',
    endTime: '',
  },
  rest: {
    startTime: '',
    endTime: '',
  },
}

const appState = useStorage('app-state', readyState)
const startTime = useStorage('start-time', new Date())
const currentTimeGap = useStorage('current-time-gap', 0)
const currentRecord = useStorage('current-record', cloneDeep(defaultRecord))
const records = useStorage('records', [] as Record[])

const recordsCount = computed(() => records.value.length)

const isOverTime = computed(() => {
  const durationSec = appState.value.isFocusState ? ms2sec(focusDurationMS.value) : ms2sec(restDurationMS.value)
  const isOver = currentTimeGap.value >= durationSec
  return isOver
})

const countDownTimeSec = computed(() => {
  const { isReadyState, isFocusState } = appState.value
  const durationSec = isFocusState ? ms2sec(focusDurationMS.value) : ms2sec(restDurationMS.value)
  const countDownTime = isReadyState ? 0 : Math.abs(durationSec - currentTimeGap.value)

  return countDownTime
})
const countDownTimeStr = computed(() => {
  const { isReadyState } = appState.value
  const countDownTime = countDownTimeSec.value
  const isOver = isReadyState ? false : isOverTime.value
  const sec = padStart(String(countDownTime % 60), 2, '0')
  const minu = padStart(String(Math.floor(countDownTime / 60)), 2, '0')

  const timeStr = isOver ? `+${minu}:${sec}` : ` ${minu}:${sec}`

  return timeStr
})
const durationTimeStr = computed(() => {
  const { isRestState } = appState.value
  const durationMS = !isRestState ? focusDurationMS.value : restDurationMS.value
  const durationSec = ms2sec(durationMS)
  const sec = padStart(String(durationSec % 60), 2, '0')
  const minu = padStart(String(Math.floor(durationSec / 60)), 2, '0')

  return `${minu}:${sec}`
})
const setCurrentTimeGap = () => {
  const now = new Date()
  const gap = Math.floor((now.getTime() - new Date(startTime.value).getTime()) / 1000)
  currentTimeGap.value = gap
}
const goNextState = (nextState?: AppState) => {
  if (nextState) appState.value = nextState
}

const { resume, pause } = useIntervalFn(() => {
  setCurrentTimeGap()
}, 500, { immediate: false })

const setStartTime = (date: Date) => startTime.value = date
const setCurrentRecord = (record: Record) => currentRecord.value = record
const saveRecord = (record: Record) => {
  records.value.push(record)
}

watch(startTime, () => {
  setCurrentTimeGap()
})

const startFocus = () => {
  const now = new Date()
  const record = currentRecord.value
  record.focus.startTime = now.toUTCString()

  setStartTime(now)
  setCurrentRecord(record)
  goNextState(focusState)
  resume()
  emitter.emit(Events.StartFocus)
}
const stopFocus = () => {
  pause()
  goNextState(readyState)
  emitter.emit(Events.StopFocus)
}
const startRest = () => {
  const now = new Date()
  const record = currentRecord.value
  record.rest.startTime = now.toUTCString()

  setStartTime(now)
  setCurrentRecord(record)
  goNextState(restState)
  resume()
  emitter.emit(Events.StartRest)
}

const finishCycle = () => {
  saveRecord(currentRecord.value)
  setCurrentRecord(cloneDeep(defaultRecord))
  goNextState(readyState)
}

const finishRest = () => {
  pause()
  const record = currentRecord.value
  record.rest.endTime = new Date().toUTCString()

  setCurrentRecord(record)
  goNextState(finishState)

  emitter.emit(Events.FinishRest)
}

const stopRest = () => {
  finishRest()
}
const finishFocus = () => {
  const record = currentRecord.value
  record.focus.endTime = new Date().toUTCString()
  pause()
  setCurrentRecord(record)
  startRest()
}

export const useCountdownModel = () => {
  if (appState.value.isFocusState || appState.value.isRestState) resume()

  return {
    focusDurationMS,
    restDurationMS,
    appState,
    startTime,
    currentTimeGap,
    currentRecord,
    records,
    recordsCount,
    isOverTime,
    countDownTimeSec,
    countDownTimeStr,
    durationTimeStr,
    startFocus,
    stopFocus,
    finishFocus,
    startRest,
    stopRest,
    finishRest,
    finishCycle,
    emitter,
  }
}