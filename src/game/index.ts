import Phaser from 'phaser'
import { delay, random } from 'lodash-es'
import { Events, eventsCenter } from '~/game/eventsCenter'

import poringIdleSprite from '/game/poring/poring-idle-sprite.png'
import poringWalkSprite from '/game/poring/poring-walk-sprite.png'
import poringDrinkSprite from '/game/poring/poring-drink-sprite.png'
import poringEatSprite from '/game/poring/poring-eat-sprite.png'

import appleJuiceItemImg from '/game/items/apple-juice.png'
import foodItemImg from '/game/items/food.gif'
import MVPSprite from '/game/items/mvp-sprite.png'
import emotionHeartSprite from '/game/emotions/emotion-heart-sprite.png'
import emotionFindSprite from '/game/emotions/emotion-find-sprite.png'
import bg0Img from '/game/bg-0.png'

enum PoringRole {
  Idle = 'poring-idle',
  Walk = 'poring-walk',
  Drink = 'poring-drink',
  Eat = 'poring-eat'
}

enum Items {
  AppleJuice = 'apple-juice-icon',
  Food = 'food',
  MVP = 'mvp'
}

enum Emotions {
  Heart = 'heart',
  Find = 'find'
}

const ANIMATION_COMPLETE = 'animationcomplete'

const posAdjustConfig: {[key in Items | Emotions]?: {x: number; y: number}} = {
  [Items.AppleJuice]: {
    x: -40,
    y: 55,
  },
  [Items.Food]: {
    x: 52,
    y: 32,
  },
  [Emotions.Heart]: {
    x: -45,
    y: -45,
  },
}
const emtionDefaultPos = {
  x: -45,
  y: -45,
}
Object.values(Emotions).forEach(emotion => posAdjustConfig[emotion] = emtionDefaultPos)
const getPosAdjust = (key: Items | Emotions) => {
  const posAdjust = posAdjustConfig[key]
  if (!posAdjust) {
    return {
      x: 0,
      y: 0,
    }
  }

  return posAdjust
}

export class MainScene extends Phaser.Scene {
  bg?: Phaser.GameObjects.TileSprite
  mainRole?: Phaser.GameObjects.Sprite
  mainRoleMap: Map<PoringRole, Phaser.GameObjects.Sprite>
  itemMap: Map<Items, Phaser.GameObjects.Image | Phaser.GameObjects.Sprite>
  emotionMap: Map<Emotions, Phaser.GameObjects.Sprite>
  currentEmotion?: Phaser.GameObjects.Sprite | null
  isRest = false
  mainRoleStartPosition = {
    x: 0,
    y: 0,
  }

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config)

    this.mainRoleMap = new Map()
    this.itemMap = new Map()
    this.emotionMap = new Map()
  }

  preload() {
    this.preloadBackground()
    this.preloadMainCharacter()
    this.preloadItems()
    this.preloadEmotions()
  }

  preloadBackground() {
    this.load.image('bg-0', bg0Img)
  }

  preloadMainCharacter() {
    const { width, height } = this.game.canvas
    const x = width / 2
    const y = height / 2 + 280
    this.mainRoleStartPosition = { x, y }

    this.load.spritesheet(PoringRole.Idle, poringIdleSprite, { frameWidth: 41, frameHeight: 39 })
    this.load.spritesheet(PoringRole.Walk, poringWalkSprite, { frameWidth: 41, frameHeight: 44 })
    this.load.spritesheet(PoringRole.Drink, poringDrinkSprite, { frameWidth: 74, frameHeight: 76 })
    this.load.spritesheet(PoringRole.Eat, poringEatSprite, { frameWidth: 41, frameHeight: 32 })
  }

  preloadItems() {
    this.load.image(Items.AppleJuice, appleJuiceItemImg)
    this.load.image(Items.Food, foodItemImg)
    this.load.spritesheet(Items.MVP, MVPSprite, { frameWidth: 121, frameHeight: 268 })
  }

  preloadEmotions() {
    this.load.spritesheet(Emotions.Heart, emotionHeartSprite, { frameWidth: 29, frameHeight: 26 })
    this.load.spritesheet(Emotions.Find, emotionFindSprite, { frameWidth: 29, frameHeight: 26 })
  }

  registerEvents() {
    eventsCenter.on(Events.Idle, () => {
      this.playEmotion(Emotions.Find, -1, 1000)
      this.doIdle()
    })

    eventsCenter.on(Events.Walk, () => {
      this.stopCurrentEmotion()
      this.doWalk()
    })

    eventsCenter.on(Events.Drink, () => {
      this.doDrink()
    })

    eventsCenter.on(Events.Eat, () => {
      this.doEat()
    })

    eventsCenter.on(Events.StartRest, () => {
      this.isRest = true
      this.doIdle()
    })

    eventsCenter.on(Events.FinishRest, () => {
      this.playEmotion(Emotions.Heart, 2, 1000)
      this.playMVP()
      this.isRest = false
      delay(() => eventsCenter.emit(Events.Idle), 4000)
    })
  }

  create() {
    this.createBackground()
    this.createMainCharacter()
    this.createItems()
    this.createEmotions()

    this.doIdle()
    this.registerEvents()
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
      () => this.createDrinkMainRole(),
      () => this.createEatMainRole(),
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

  createDrinkMainRole() {
    const role = this.mainRoleMap.get(PoringRole.Drink)
    if (role) return role

    const { x, y } = this.mainRoleStartPosition
    this.anims.create({
      key: PoringRole.Drink,
      frames: this.anims.generateFrameNumbers(PoringRole.Drink, { start: 0, end: 12 }),
      frameRate: 16,
      repeat: 2,
    })
    const poring = this.add.sprite(x, y, PoringRole.Drink)
    // poring.setFlipX(true)
    poring.setScale(2)
    poring.setVisible(false)
    this.mainRoleMap.set(PoringRole.Drink, poring)

    return poring
  }

  createEatMainRole() {
    const role = this.mainRoleMap.get(PoringRole.Eat)
    if (role) return role

    const { x, y } = this.mainRoleStartPosition
    this.anims.create({
      key: PoringRole.Eat,
      frames: this.anims.generateFrameNumbers(PoringRole.Eat, { start: 0, end: 9 }),
      frameRate: 20,
      repeat: 4,
    })
    const poring = this.add.sprite(x, y, PoringRole.Eat)
    poring.setFlipX(true)
    poring.setScale(2)
    poring.setVisible(false)
    this.mainRoleMap.set(PoringRole.Eat, poring)

    return poring
  }

  createItems() {
    const { x, y } = this.mainRoleStartPosition
    const createAppleJuice = () => {
      const appleJuice = this.add.image(x, y, Items.AppleJuice)
      appleJuice.setScale(2)
      appleJuice.setAngle(15)
      appleJuice.visible = false

      this.itemMap.set(Items.AppleJuice, appleJuice)
      return appleJuice
    }
    const createFood = () => {
      const food = this.add.image(x, y, Items.Food)
      food.setScale(2)
      food.setAngle(-20)
      food.visible = false

      this.itemMap.set(Items.Food, food)
      return food
    }

    const createMVP = () => {
      this.anims.create({
        key: Items.MVP,
        frames: this.anims.generateFrameNumbers(Items.MVP, { start: 0, end: 50 }),
        frameRate: 20,
        repeat: 0,
      })
      const mvp = this.add.sprite(x, y - 210, Items.MVP)
      mvp.setScale(2)
      mvp.setVisible(false)

      this.itemMap.set(Items.MVP, mvp)
      return mvp
    }

    const itemCreators = [
      () => createAppleJuice(),
      () => createFood(),
      () => createMVP(),
    ]

    itemCreators.forEach(creator => creator())
  }

  createEmotions() {
    const { x, y } = this.mainRoleStartPosition

    const createEmotion = (emotionName: Emotions) => {
      this.anims.create({
        key: emotionName,
        frames: this.anims.generateFrameNumbers(emotionName, { start: 0, end: 28 }),
        frameRate: 20,
        repeat: 0,
      })
      const adjustPos = getPosAdjust(emotionName)
      const emotion = this.add.sprite(x + adjustPos.x, y + adjustPos.y, Emotions.Heart)
      emotion.setScale(2)
      emotion.setVisible(false)

      this.emotionMap.set(emotionName, emotion)
      return emotion
    }

    const emotionCreators = Object.values(Emotions).map(emotionName => () => createEmotion(emotionName))

    emotionCreators.forEach(creator => creator())
  }

  playMainRole(role: PoringRole): Phaser.GameObjects.Sprite | undefined {
    const targetRole = this.mainRoleMap.get(role)
    if (!targetRole) return

    if (this.mainRole) {
      const { x, y } = this.mainRole
      targetRole.setPosition(x, y)
      this.mainRole.setVisible(false)
    }

    targetRole.setVisible(true)
    this.mainRole = targetRole
    const player = this.mainRole.play(role, true)

    return player
  }

  playMVP() {
    const mvp = this.itemMap.get(Items.MVP)
    if (mvp instanceof Phaser.GameObjects.Sprite) {
      mvp.setVisible(true)
      mvp.play(Items.MVP, true).once(ANIMATION_COMPLETE, () => {
        mvp.setVisible(false)
      })
    }
  }

  /**
   *
   * @param {Emotions} emotionName
   * @param {number} [times=1] value -1 for infinity
   * @param {number} [delayTime=0]
   * @memberof MainScene
   */
  playEmotion(emotionName: Emotions, times = 1, delayTime = 0) {
    // TODO: logic is complex, need to refact it later
    this.stopCurrentEmotion()
    const emotion = this.emotionMap.get(emotionName)
    if (!emotion) return

    const getIsDiff = () => this.currentEmotion && (this.currentEmotion !== emotion)

    const play = () => {
      if (!this.currentEmotion) return
      emotion.setVisible(true)

      emotion.play(emotionName, true).once(ANIMATION_COMPLETE, () => {
        const isDiff = getIsDiff()
        const nextTimes = isDiff || !this.currentEmotion ? 0 : times - 1
        if (nextTimes === 0) {
          emotion.setVisible(false)
          if (this.currentEmotion === emotion) this.currentEmotion = null
        }
        else {
          this.playEmotion(emotionName, nextTimes, delayTime)
        }
      })
    }
    this.currentEmotion = emotion
    delay(() => play(), delayTime)
  }

  stopCurrentEmotion() {
    if (this.currentEmotion) {
      this.currentEmotion.setVisible(false)
      this.currentEmotion = null
    }
  }

  doWalk() {
    this.playMainRole(PoringRole.Walk)
  }

  doIdle() {
    this.playMainRole(PoringRole.Idle)
  }

  doDrink() {
    const appleJuice = this.itemMap.get(Items.AppleJuice)
    if (!this.mainRole || !appleJuice) return

    const { x, y } = this.mainRole
    const posAdjust = getPosAdjust(Items.AppleJuice)
    appleJuice.setPosition(x + posAdjust.x, y + posAdjust.y)
    appleJuice.setVisible(true)
    this.playMainRole(PoringRole.Drink)?.once(ANIMATION_COMPLETE, () => {
      appleJuice?.setVisible(false)
      this.playMainRole(PoringRole.Idle)
    })
  }

  doEat() {
    const food = this.itemMap.get(Items.Food)
    if (!this.mainRole || !food) return

    const { x, y } = this.mainRole
    const posAdjust = getPosAdjust(Items.Food)
    food.setPosition(x + posAdjust.x, y + posAdjust.y)
    food.setVisible(true)
    this.playMainRole(PoringRole.Eat)?.once(ANIMATION_COMPLETE, () => {
      food?.setVisible(false)
      this.playMainRole(PoringRole.Idle)
    })
  }

  doRest() {
    const actions = [
      () => this.doDrink(),
      () => this.doEat(),
    ]
    const index = random(actions.length - 1)
    const action = actions[index]

    action()
  }

  get isWalking() {
    const walkRole = this.mainRoleMap.get(PoringRole.Walk)
    return this.mainRole === walkRole
  }

  get isIdling() {
    const idelRole = this.mainRoleMap.get(PoringRole.Idle)
    return this.mainRole === idelRole
  }

  get isEmotioning() {
    return !!this.currentEmotion
  }

  update() {
    if (this.bg && this.isWalking) this.bg.tilePositionX += 3
    if (this.isIdling && this.isRest) this.doRest()
  }
}

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config)
    this.scene.add('Game', MainScene)
    this.scene.start('Game')
  }
}

export const createGame = (onProgressCB: (value: number) => void, onCompleteCB: () => void): Game => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'trip-pomodoro-canvas-wrap',
    width: 380,
    height: 760,
    callbacks: {
      postBoot(game: Phaser.Game) {
        const scene = game.scene.getScene('Game')
        scene.load.on('progress', onProgressCB)
        scene.load.once('complete', onCompleteCB)
      },
    },
  }
  const game = new Game(config)
  return game
}
