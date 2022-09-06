import Phaser from 'phaser'

export enum Events {
  Idle = 'idle',
  Walk = 'walk',
  Drink = 'drink'
}

export const eventsCenter = new Phaser.Events.EventEmitter()
