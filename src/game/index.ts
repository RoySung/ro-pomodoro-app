import Phaser from 'phaser'
import poringIdleSprite from '/sprites/poring/poring-idle-sprite.png'
import poringWalkSprite from '/sprites/poring/poring-walk-sprite.png'
import bg0Img from '/bg-0.png'

enum PoringRole {
  Idle = 'poring-idle',
  Walk = 'poring-walk'
}

export class MainScene extends Phaser.Scene {
  bg?: Phaser.GameObjects.TileSprite
  mainRole?: Phaser.GameObjects.Sprite
  mainRoleMap: Map<PoringRole, Phaser.GameObjects.Sprite>
  mainRoleStartPosition = {
    x: 0,
    y: 0,
  }

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config)

    this.mainRoleMap = new Map()
  }

  preload() {
    this.preloadBackground()
    this.preloadMainCharacter()
  }

  preloadBackground() {
    this.load.image('bg-0', bg0Img)
  }

  preloadMainCharacter() {
    const { width, height } = this.game.canvas
    const x = width / 2
    const y = height / 2 + 300
    this.mainRoleStartPosition = { x, y }

    this.load.spritesheet(PoringRole.Idle, poringIdleSprite, { frameWidth: 41, frameHeight: 39 })
    this.load.spritesheet(PoringRole.Walk, poringWalkSprite, { frameWidth: 41, frameHeight: 44 })
  }

  create() {
    this.createBackground()
    this.createMainCharacter()
    this.playMainRole(PoringRole.Idle)

    setTimeout(() => {
      this.doWalking()
    }, 2000)
  }

  createBackground() {
    const { width, height } = this.game.canvas
    this.add.rectangle(0, 0, width, height, 0x6B7FAF).setOrigin(0, 0)
    const tileWHRate = 1228 / 800
    const tileWidth = width * tileWHRate
    this.bg = this.add.tileSprite(0, 0, tileWidth, height, 'bg-0')
    this.bg.setOrigin(0, 0)
  }

  createMainCharacter() {
    const roleCreators = [
      () => this.createIdleMainRole(),
      () => this.createWalkMainRole(),
    ]
    roleCreators.forEach(creator => creator())
  }

  createIdleMainRole() {
    const role = this.mainRoleMap.get(PoringRole.Idle)
    if (role) return role

    const { x, y } = this.mainRoleStartPosition
    this.anims.create({
      key: PoringRole.Idle,
      frames: this.anims.generateFrameNumbers(PoringRole.Idle, { start: 0, end: 4 }),
      frameRate: 8,
      repeat: -1,
    })
    const poring = this.add.sprite(x, y, PoringRole.Idle)
    poring.setFlipX(true)
    poring.setScale(2)
    poring.setVisible(false)
    this.mainRoleMap.set(PoringRole.Idle, poring)

    return poring
  }

  createWalkMainRole() {
    const role = this.mainRoleMap.get(PoringRole.Walk)
    if (role) return role

    const { x, y } = this.mainRoleStartPosition
    this.anims.create({
      key: PoringRole.Walk,
      frames: this.anims.generateFrameNumbers(PoringRole.Walk, { start: 0, end: 9 }),
      frameRate: 26,
      repeat: -1,
    })
    const poring = this.add.sprite(x, y, PoringRole.Walk)
    poring.setFlipX(true)
    poring.setScale(2)
    poring.setVisible(false)
    this.mainRoleMap.set(PoringRole.Walk, poring)

    return poring
  }

  playMainRole(role: PoringRole) {
    const targetRole = this.mainRoleMap.get(role)
    if (!targetRole) return

    if (this.mainRole) {
      const { x, y } = this.mainRole
      targetRole.setPosition(x, y)
      this.mainRole.setVisible(false)
    }

    targetRole.setVisible(true)
    this.mainRole = targetRole
    this.mainRole.play(role)
  }

  doWalking() {
    this.playMainRole(PoringRole.Walk)
  }

  get isWalking() {
    const walkRole = this.mainRoleMap.get(PoringRole.Walk)
    return this.mainRole === walkRole
  }

  update() {
    if (this.bg && this.isWalking) this.bg.tilePositionX += 3
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'trip-pomodoro-canvas-wrap',
  width: 400,
  height: 800,
}

class Game extends Phaser.Game {
  constructor(GameConfig?: Phaser.Types.Core.GameConfig) {
    super(GameConfig)
    this.scene.add('Game', MainScene)
    this.scene.start('Game')
  }
}

export const createGame = () => {
  const game = new Game(config)
  return game
}
