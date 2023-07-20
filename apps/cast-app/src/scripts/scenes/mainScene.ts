import config from '../config'
import AnimatedTiles from '../helpers/animatedTiles'
import Debug from '../helpers/debug'
import CountDown from '../helpers/countdown'

import Hud from '../objects/hud'
import Player from '../objects/player'
import Brick from '../objects/brick'
import CoinSpin from '../objects/coinSpin'
import Flag from '../objects/flag'
import { Enemy, EnemyGroup, EnemyName } from '../objects/enemies'
import { PowerUpGroup, Mushroom, Flower, Star } from '../objects/powerUps'

import { Move, Jump, Large, Fire, Invincible, EnterPipe, HitBrick } from '../powers'
import { arrayProps2ObjProps } from '../utils'
import { container } from 'tsyringe'

// @ts-ignore
import { onPlayerJoin, insertCoin, isHost, myPlayer } from 'playroomkit'

type SceneData = {
  [prop: string]: any
}

export default class MainScene extends Phaser.Scene {
  music: Phaser.Sound.BaseSound
  animatedTiles: AnimatedTiles
  hud: Hud
  powerUpGroup: PowerUpGroup
  enemyGroup: EnemyGroup
  rooms: rooms = {}
  dests: dests = {}
  players = []
  NPlayerKeys:any []
  NPlayerCursor:any []
  worldLayer: Phaser.Tilemaps.TilemapLayer
  brick: Brick
  indicator : Phaser.GameObjects.Image

  constructor() {
    super({ key: 'MainScene' })
  }

  addingPlayerCursors() {
    const offset = this.players.length * 10;
    return this.input.keyboard.addKeys({
      up: offset + 0,
      down: offset + 1,
      left: offset + 2,
      right: offset + 3,
      space: offset + 4,
    });

    // for Keyboard testing
    // return this.input.keyboard.addKeys({
    //   up: Phaser.Input.Keyboard.KeyCodes.UP,
    //   down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    //   left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    //   right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    //   space: Phaser.Input.Keyboard.KeyCodes.UP, 
    // });
  }

  // Simulate pressing a key
  simulateKeyPress(keyCode) {
    const keyObj = this.input.keyboard.addKey(keyCode)
    keyObj.isDown = true
    keyObj.timeDown = this.time.now
    keyObj.isUp = false
    keyObj.timeUp = 0
    this.input.keyboard.emit('keydown')
  }

  // Simulate releasing a key
  simulateKeyRelease(keyCode) {
    const keyObj = this.input.keyboard.addKey(keyCode)
    keyObj.isDown = false
    keyObj.timeDown = 0
    keyObj.isUp = true
    keyObj.timeUp = this.time.now
    this.input.keyboard.emit('keyup')
  }

  // Add another mario to the game
  addPlayer(playerState) {
    console.log("printing playerstate",playerState)
    console.log("printing players",this.players);

    let existingPlayerIndex = Array.isArray(this.players) ? this.players.findIndex((p) => p.state.id === playerState.id) : -1

    const cursors = this.addingPlayerCursors();
    const mario = new Player({
      scene: this,
      texture: 'atlas',
      frame: 'mario/stand',
      x: config.initX + (50*(this.players.length+1)),
      y: config.initY,
      allowPowers: [Jump, Move, Invincible, Large, Fire, EnterPipe, HitBrick],
    }).on('die', () => {
      this.time.delayedCall(3000, () => {
        if (Number(this.hud.getValue('lives')) <= 0) {
          this.gameOver()
        } else {
          this.restartGame()
        }
      })
    })

    const endPoint = this.worldLayer.findByIndex(5)
    // 终点旗杆
    new Flag(this, endPoint.pixelX, endPoint.pixelY).overlap(mario, () => this.restartGame(false))

    mario.powers
      .add(Move, () => new Move(mario))
      .add(Jump, () => new Jump(mario))
      .add(EnterPipe, () => new EnterPipe(cursors, this.dests, this.rooms))
      .add(HitBrick, () => new HitBrick(mario, ['up']))

    // @ts-ignore
    this.physics.add.collider(mario, this.worldLayer, this.playerColliderWorld, undefined, this)
    // @ts-ignore
    this.physics.add.overlap(mario, this.enemyGroup, this.playerOverlapEnemy, undefined, this)
    // @ts-ignore
    this.physics.add.collider(this.brick, this.enemyGroup, (brick: Brick, enemy: Enemy) => {
      this.brickColliderEnemy(brick, enemy, mario)
    }, undefined, this)
  
    new CountDown(this)
    .start(config.playTime)
    .on('interval', (time: number) => {
      this.hud.setValue('time', time)
    })
    .on('end', () => mario.die())

    container
      .register('Cursors_'+ playerState.id, { useValue: cursors })
      .register('Player_' + playerState.id, { useValue: mario })

    const camera = this.cameras.main
    const room = this.rooms.room1
    camera.setBounds(room.x, room.y, room.width, room.height).startFollow(mario)

    console.log("existing player index",existingPlayerIndex);
    if (existingPlayerIndex === -1) {
    this.players.push({
      // sprite,
      state: playerState,
      cursors,
      mario,
    })
  } 
  else if (this.players[existingPlayerIndex]) {
      this.players[existingPlayerIndex] = {
        // sprite,
        ...this.players[existingPlayerIndex],
        state: playerState,
        // cursors,
        mario,
    }
  }

    playerState.onQuit(() => {
      // sprite.destroy();
      let toKill = this.players.filter((p) => p.state.id === playerState.id)
      toKill.forEach((p, i) => {
        p.mario.destroy()
      })

      this.players = this.players.filter((p) => p.state.id !== playerState.id)

      camera.setBounds(room.x, room.y, room.width, room.height).startFollow(this.players[this.players.length - 1].mario)


    })

  }

  create(sceneData: SceneData) {
    // @ts-ignore debug
    window.__myGame = this
    
    const map = this.make.tilemap({ key: 'map' })
    const tileset = map.addTilesetImage('SuperMarioBros-World1-1', 'tiles')
    const worldLayer = map.createLayer('world', tileset).setCollisionByProperty({ collide: true })
    this.worldLayer = worldLayer
    this.indicator = this.add.image(20, 20, 'player-indicator');
    this.indicator.setScale(0.0125);

    // 添加背景音乐
    this.music = this.sound.add('overworld')
    this.music.play({ loop: true })

    // 添加游戏背景
    this.add.tileSprite(0, 0, worldLayer.width, 500, 'background-clouds')

    // 添加游戏说明
    this.add.bitmapText(16, 100, 'font', config.helpText, 8).setDepth(100)

    // tile 动画
    this.animatedTiles = new AnimatedTiles(map, tileset)

    this.parseModifiersLayer(map, 'modifiers')

    const enemiesData = this.parseEnemiesLayer(map, 'enemies')
    this.enemyGroup = new EnemyGroup(this, enemiesData)
    this.powerUpGroup = new PowerUpGroup(this)

    // 分数、金币、倒计时等信息显示
    this.hud = new Hud(this, [
      { title: 'SCORE', key: 'score', value: 0 },
      { title: 'COINS', key: 'coins', value: sceneData.coins || 0 },
      { title: 'TIME', key: 'time', value: config.playTime },
      { title: 'LIVES', key: 'lives', value: sceneData.lives || config.lives },
      { title: 'FPS', key: 'fps', value: () => Math.floor(this.game.loop.actualFps) },
    ])

    // 调试
    new Debug({ scene: this, layer: worldLayer })

    // 砖块对象
    const brick = new Brick({ scene: this })
    this.brick = brick

    // 在容器里注册这些对象，用于提供给依赖它们的类自动注入
    container
      .register('Map', { useValue: map })
      .register('WorldLayer', { useValue: worldLayer })
      .register(Brick, { useValue: brick })
      .register(EnemyGroup, { useValue: this.enemyGroup })
      .register(PowerUpGroup, { useValue: this.powerUpGroup })

    const camera = this.cameras.main
    camera.roundPixels = true

    this.physics.add.collider(this.powerUpGroup, worldLayer)
    // @ts-ignore
    this.physics.add.collider(this.enemyGroup, worldLayer, this.enemyColliderWorld, undefined, this)
    // @ts-ignore
    this.physics.add.overlap(this.enemyGroup, this.enemyGroup, this.enemyOverlapEnemy, undefined, this)
    // @ts-ignore
    this.physics.add.collider(brick, this.powerUpGroup)

    onPlayerJoin((playerState) => this.addPlayer(playerState))


  }

  simulator(player) {
    const _playerKeys = player.cursors;
    
    const { key, event } = player.state.getState('keyPress') || {}
    
    if (event === 'keyDown') {
      if (key === 'left') {
        this.simulateKeyPress(_playerKeys.left)
      }
      if (key === 'up') {
        this.simulateKeyPress(_playerKeys.up)
      }
      if (key === 'right') {
        this.simulateKeyPress(_playerKeys.right)
      }
      if (key === 'down') {
        this.simulateKeyPress(_playerKeys.down)
      }
      if (key === 'x') {
        this.simulateKeyPress(34)
      }
    }
    if (event === 'keyUp') {
      if (key === 'left') {
        this.simulateKeyRelease(_playerKeys.left)
      }
      if (key === 'up') {
        this.simulateKeyRelease(_playerKeys.up)
      }
      if (key === 'right') {
        this.simulateKeyRelease(_playerKeys.right)
      }
      if (key === 'down') {
        this.simulateKeyRelease(_playerKeys.down)
      }
      if (key === 'x') {
        this.simulateKeyRelease(_playerKeys.x)
      }
    }
  }

  update(time: number, delta: number) {
    if (this.physics.world.isPaused) return
    const { animatedTiles, hud, enemyGroup, powerUpGroup } = this
    animatedTiles.update(delta)
    hud.update()



    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]
      //set indicator
      this.indicator.setX(player.mario.x < this.game.config.width ? player.mario.x : parseInt(String(this.game.config.width)) - 50)
      this.indicator.setY(player.mario.y - 50)
      console.log("player", player) 
      enemyGroup.update(time, delta, player.mario)
      if (player.mario.body) {
        // player.mario.body.checkCollision.none = false
        powerUpGroup.update(time, delta, player.mario)
        player.mario.update(time, delta, player.cursors)
      }
      this.simulator(player)
    }

  }

  /**
   * 解析修饰层，扩展瓷砖属性
   * @param name 图层名称
   */
  private parseModifiersLayer(map: Phaser.Tilemaps.Tilemap, name: string) {
    const worldLayer = map.getLayer('world').tilemapLayer
    const parser = {
      powerUp: (modifier: Phaser.Types.Tilemaps.TiledObject) => {
        const tile = worldLayer.getTileAt(Number(modifier.x) / 16, Number(modifier.y) / 16 - 1)
        tile.properties.powerUp = modifier.name
        switch (modifier.name) {
          case '1up':
            tile.properties.callback = 'questionMark'
            tile.setCollision(false, false, false, true)
            break
          case 'coin':
            tile.properties.hitNumber = 4
        }
      },
      pipe: (modifier: Phaser.Types.Tilemaps.TiledObject) => {
        const tile = worldLayer.getTileAt(Number(modifier.x) / 16, Number(modifier.y) / 16)
        tile.properties.dest = modifier.name
        Object.assign(tile.properties, arrayProps2ObjProps(modifier.properties))
      },
      dest: ({ name, x, y, properties }: Phaser.Types.Tilemaps.TiledObject) => {
        this.dests[name] = {
          name,
          x: Number(x),
          y: Number(y),
          ...arrayProps2ObjProps(properties),
        }
      },
      room: ({ name, x, y, width, height }: Phaser.Types.Tilemaps.TiledObject) => {
        this.rooms[name] = {
          name,
          x: Number(x),
          y: Number(y),
          width: Number(width),
          height: Number(height),
        }
      },
    }

    map.getObjectLayer(name).objects.forEach((tiled) => {
      parser[tiled.type]?.(tiled)
    })
  }

  /**
   * 解析敌人图层，获取敌人的坐标数据
   * @param name 图层名称
   */
  private parseEnemiesLayer(map: Phaser.Tilemaps.Tilemap, name: string) {
    return map.getObjectLayer(name).objects.map((tile) => ({
      name: tile.name as EnemyName,
      x: tile.x as number,
      y: tile.y as number,
    }))
  }

  private enemyColliderWorld(enemy: Enemy, tile: Phaser.Tilemaps.Tile) {
    enemy.colliderWorld(tile)
  }

  private enemyOverlapEnemy(enemy1: Enemy, enemy2: Enemy) {
    enemy1.overlapEnemy(enemy2)
    enemy2.overlapEnemy(enemy1)
  }

  private playerOverlapEnemy(mario: Player, enemy: Enemy) {
    if (enemy.dead || mario.dead) return

    // body.touching 对象会出现多个为 true 的值，为避免错误，加上了玩家速度的判断。
    const stepOnEnemy = mario.body.touching.down && enemy.body.touching.up && mario.body.velocity.y !== 0

    if (mario.overlapEnemy(enemy, stepOnEnemy)) return
    if (enemy.overlapPlayer(mario, stepOnEnemy)) return

    if (stepOnEnemy) {
      mario.body.setVelocityY(-80)
    } else if (!mario.protected && enemy.attackPower) {
      mario.die()
    }
  }

  private playerColliderWorld(mario: Player, tile: Phaser.Tilemaps.Tile) {
    if (mario.colliderWorld(tile)) return
  }

  private brickColliderEnemy(brick: Brick, enemy: Enemy, mario: Player) {
    if (enemy.dead) return
    if (mario.powers.has(Large)) {
      enemy.die(true)
    }
  }

  /**
   * 创建道具
   * @param name 道具名
   */
  private createPowerUp(name: string, x: number, y: number) {
    const marios = this.players.map((player) => player.mario).filter(Boolean)
    let params: any[] = []

    switch (name) {
      case 'mushroom':
        params =
          (marios.includes(mario => mario.powers.has(Large)))
            ? [Flower, [Fire, Large], { type: 'super' }]
            : [Mushroom, [Large], { type: 'super' }]
        break
      case 'star':
        params = [Star, [Invincible]]
        break
      case '1up':
        params = [Mushroom, [null], { type: '1up' }, () => this.hud.incDec('lives', 1)]
        break
      default:
        new CoinSpin(this, x, y, 'atlas').spin()
    }

    const [PowerUp, Power, options, onOverlap] = params
    if (PowerUp) {
      console.log('createPowerUp', PowerUp)

      const powerUps = marios.map((mario) => {
        if (!mario.body) return
        return new PowerUp({ scene: this, x, y, texture: 'atlas', ...options }).overlap(
        mario,
        onOverlap ||
          (() => {
            for (let i = 0; i < Power.length; i++) {
              mario.powers.add(Power[i], () => new Power[i](mario))
            }
          })
      )}).filter(Boolean)

      powerUps.forEach((powerUp) => {
        this.powerUpGroup.add(powerUp)
      })
    }
  }

  private restartGame(saveData = true) {
    const data = saveData
      ? {
          coins: this.hud.getValue('coins'),
          lives: this.hud.getValue('lives'),
        }
      : {}
    container.clearInstances()
    this.scene.restart(data)
  }

  private gameOver() {
    // if (window.confirm('GameOver!')) {
    //   this.restartGame(false)
    // }
    this.restartGame(false)
  }
}
