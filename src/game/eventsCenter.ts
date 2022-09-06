import Phaser from 'phaser'

export enum Events {
  Idle = 'idle',
  Walk = 'walk'
}

export const eventsCenter = new Phaser.Events.EventEmitter()
