import Phaser from 'phaser'

export enum Events {
  Idle = 'idle',
  Walk = 'walk',
  Drink = 'drink',
  Eat = 'eat'
}

export const eventsCenter = new Phaser.Events.EventEmitter()
