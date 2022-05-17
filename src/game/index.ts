import Phaser from 'phaser'
import logoImg from '/logo.png'

export class MainScene extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config)
  }

  preload() {
    this.load.image('logo', logoImg)
  }

  create() {
    const x = this.game.canvas.width / 2
    const y = this.game.canvas.height / 2
    this.add.image(x, y, 'logo')

    this.add.text(0, 0, 'Hello World!')
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'flappy-bird-game',
  width: 800,
  height: 600,
}

export const createGame = () => {
  class Game extends Phaser.Game {
    constructor(GameConfig?: Phaser.Types.Core.GameConfig) {
      super(GameConfig)
      this.scene.add('Game', MainScene)
      this.scene.start('Game')
    }
  }
  const game = new Game(config)
  return game
}
