import mitt from 'mitt'

export enum Events {
  Idle = 'idle',
  Walk = 'walk',
  Drink = 'drink',
  Eat = 'eat',
  StartRest = 'start-rest',
  FinishRest = 'finish-rest',
  SettingSound = 'setting-sound'
}
type EventType = {
  [key in Events]: unknown
}

type SettingSoundEventType = {
  [Events.SettingSound]: boolean
}
export const eventsCenter = mitt<EventType&SettingSoundEventType>()
