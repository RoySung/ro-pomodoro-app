import Phaser from 'phaser'

export enum Events {
  Idle = 'idle',
  Walk = 'walk',
  Drink = 'drink',
  Eat = 'eat',
  StartRest = 'start-rest',
  StopRest = 'stop-rest'
}

export const eventsCenter = new Phaser.Events.EventEmitter()
