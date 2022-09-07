import mitt from 'mitt'

export enum Events {
  Idle = 'idle',
  Walk = 'walk',
  Drink = 'drink',
  Eat = 'eat',
  StartRest = 'start-rest',
  FinishRest = 'finish-rest',
}

export const eventsCenter = mitt()
