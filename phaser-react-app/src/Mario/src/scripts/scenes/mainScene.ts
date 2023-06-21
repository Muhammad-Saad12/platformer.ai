import config from '../config'
import config1 from '../config1'
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
import { onPlayerJoin, insertCoin, isHost, myPlayer } from "playroomkit";


// mapping for player keys
const playerKeys = [
    {
      up:Phaser.Input.Keyboard.KeyCodes.UP,
      down:Phaser.Input.Keyboard.KeyCodes.DOWN,
      left:Phaser.Input.Keyboard.KeyCodes.LEFT,
      right:Phaser.Input.Keyboard.KeyCodes.RIGHT,
      space:Phaser.Input.Keyboard.KeyCodes.UP,
    },
    {
      up:Phaser.Input.Keyboard.KeyCodes.W,
      down:Phaser.Input.Keyboard.KeyCodes.S,
      left:Phaser.Input.Keyboard.KeyCodes.A,
      right:Phaser.Input.Keyboard.KeyCodes.D,
      space:Phaser.Input.Keyboard.KeyCodes.W,
    },
    {
      up:Phaser.Input.Keyboard.KeyCodes.T,
      down:Phaser.Input.Keyboard.KeyCodes.G,
      left:Phaser.Input.Keyboard.KeyCodes.F,
      right:Phaser.Input.Keyboard.KeyCodes.H,
      space:Phaser.Input.Keyboard.KeyCodes.T,
    },
    {
      up:Phaser.Input.Keyboard.KeyCodes.I,
      down:Phaser.Input.Keyboard.KeyCodes.K,
      left:Phaser.Input.Keyboard.KeyCodes.J,
      right:Phaser.Input.Keyboard.KeyCodes.L,
      space:Phaser.Input.Keyboard.KeyCodes.I,
    },
]
  


type SceneData = {
  [prop: string]: any
}

export default class MainScene extends Phaser.Scene {
  music: Phaser.Sound.BaseSound
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  cursors1: any
  animatedTiles: AnimatedTiles
  hud: Hud
  mario: Player
  mario1: Player
  powerUpGroup: PowerUpGroup
  enemyGroup: EnemyGroup
  rooms: rooms = {}
  dests: dests = {}
  players = []; 

  constructor() {
    super({ key: 'MainScene' })
  }

      // Simulate pressing a key
 simulateKeyPress(keyCode) {
  const keyObj = this.input.keyboard.addKey(keyCode);
  keyObj.isDown = true;
  keyObj.timeDown = this.time.now;
  keyObj.isUp = false;
  keyObj.timeUp = 0;
  this.input.keyboard.emit('keydown');
}

// Simulate releasing a key
 simulateKeyRelease(keyCode) {
  const keyObj = this.input.keyboard.addKey(keyCode);
  keyObj.isDown = false;
  keyObj.timeDown = 0;
  keyObj.isUp = true;
  keyObj.timeUp = this.time.now;
  this.input.keyboard.emit('keyup');
}


addPlayer(playerState) {
  // add another mario to the game
  // const sprite = this.add.rectangle(
  //   Phaser.Math.Between(100, 500), 200, 50, 50, playerState.getProfile().color.hex);
  // this.physics.add.existing(sprite, false);
  // sprite.body.setCollideWorldBounds(true);
  this.players.push({
    // sprite,
    state: playerState
  });
  playerState.onQuit(() => {
    // sprite.destroy();
    this.players = this.players.filter(p => p.state !== playerState);
  });
}

  create(sceneData: SceneData) {
    // @ts-ignore debug
    window.__myGame = this

    const map = this.make.tilemap({ key: 'map' })
    const tileset = map.addTilesetImage('SuperMarioBros-World1-1', 'tiles')
    const worldLayer = map.createLayer('world', tileset).setCollisionByProperty({ collide: true })


    onPlayerJoin(playerState => this.addPlayer(playerState));



// // Example usage
// this.simulateKeyPress(Phaser.Input.Keyboard.KeyCodes.UP);

// setTimeout(() => {
//   this.simulateKeyRelease(Phaser.Input.Keyboard.KeyCodes.UP);
// },5000);


// with Playroom

// this.playroomSDK.onKeyDown("W", ()=>{
//   console.log("hello world")
// this.simulateKeyPress(Phaser.Input.Keyboard.KeyCodes.UP);
// })




    this.cursors = this.input.keyboard.createCursorKeys()
    this.cursors1 = this.input.keyboard.addKeys(playerKeys[1]);
         

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

    this.mario = new Player({
      scene: this,
      texture: 'atlas',
      frame: 'mario/stand',
      x: config.initX,
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

    this.mario1 = new Player({
      scene: this,
      texture: 'atlas',
      frame: 'mario/stand',
      x: config1.initX,
      y: config1.initY,
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

    const endPoint = worldLayer.findByIndex(5)
    // 终点旗杆
    new Flag(this, endPoint.pixelX, endPoint.pixelY).overlap(this.mario, () => this.restartGame(false))
    new Flag(this, endPoint.pixelX, endPoint.pixelY).overlap(this.mario1, () => this.restartGame(false))

    // 游戏倒计时
    new CountDown(this)
      .start(config.playTime)
      .on('interval', (time: number) => {
        this.hud.setValue('time', time)
      })
      .on('end', () => this.mario.die())

      new CountDown(this)
      .start(config1.playTime)
      .on('interval', (time: number) => {
        this.hud.setValue('time', time)
      })
      .on('end', () => this.mario1.die())

    // 调试
    new Debug({ scene: this, layer: worldLayer })

    // 砖块对象
    const brick = new Brick({ scene: this })

    // 在容器里注册这些对象，用于提供给依赖它们的类自动注入
    container
      .register('Map', { useValue: map })
      .register('WorldLayer', { useValue: worldLayer })
      .register('Cursors', { useValue: this.cursors })
      // .register('Cursors', { useValue: this.cursors1 })
      .register(Brick, { useValue: brick })
      .register(Player, { useValue: this.mario })
      // .register(Player, { useValue: this.mario1 })
      .register(EnemyGroup, { useValue: this.enemyGroup })
      .register(PowerUpGroup, { useValue: this.powerUpGroup })

    this.mario.powers
      .add(Move, () => new Move(this.mario))
      .add(Jump, () => new Jump(this.mario))
      .add(EnterPipe, () => new EnterPipe(this.cursors, this.dests, this.rooms))
      .add(HitBrick, () => new HitBrick(this.mario, ['up']))

      this.mario1.powers
      .add(Move, () => new Move(this.mario1))
      .add(Jump, () => new Jump(this.mario1))
      .add(EnterPipe, () => new EnterPipe(this.cursors1, this.dests, this.rooms))
      .add(HitBrick, () => new HitBrick(this.mario1, ['up']))

    const camera = this.cameras.main
    const room = this.rooms.room1
    camera.setBounds(room.x, room.y, room.width, room.height).startFollow(this.mario)
    // camera.setBounds(room.x, room.y, room.width, room.height).startFollow(this.mario1)
    camera.roundPixels = true

    this.physics.add.collider(this.powerUpGroup, worldLayer)
    // @ts-ignore
    this.physics.add.collider(this.enemyGroup, worldLayer, this.enemyColliderWorld, undefined, this)
    // @ts-ignore
    this.physics.add.collider(this.mario, worldLayer, this.playerColliderWorld, undefined, this)
    // @ts-ignore
    this.physics.add.collider(this.mario1, worldLayer, this.playerColliderWorld, undefined, this)
    // @ts-ignore
    this.physics.add.overlap(this.mario, this.enemyGroup, this.playerOverlapEnemy, undefined, this)
    // @ts-ignore
    this.physics.add.overlap(this.mario1, this.enemyGroup, this.playerOverlapEnemy, undefined, this)
    // @ts-ignore
    this.physics.add.overlap(this.enemyGroup, this.enemyGroup, this.enemyOverlapEnemy, undefined, this)
    // @ts-ignore
    this.physics.add.collider(brick, this.enemyGroup, this.brickColliderEnemy, undefined, this)
    this.physics.add.collider(brick, this.powerUpGroup)
  }

  simulator(player,_playerKeys){
    
   
      const { key, event } = player.state.getState("keyPress") || {};
      if (event === "keyDown") {
        if (key === "left") {
          // player.sprite.body.setVelocityX(-160);
          this.simulateKeyPress(_playerKeys.left);
        }
        if (key === "up") {
          // player.sprite.body.setVelocityX(160);
          this.simulateKeyPress(_playerKeys.up);
        }
        if (key === "right") {
          // player.sprite.body.setVelocityX(160);
          this.simulateKeyPress(_playerKeys.right);
        }
        if (key === "down") {
          // player.sprite.body.setVelocityX(160);
          this.simulateKeyPress(_playerKeys.down);
        }
        if (key === "x") {
          // player.sprite.body.setVelocityX(160);
          this.simulateKeyPress(34);
        }
        // if (key === "up" && player.sprite.body.onFloor()) {
        //   // player.sprite.body.setVelocityY(-330);
        // }
      }
      if (event === "keyUp") {
        if (key === "left") {
          // player.sprite.body.setVelocityX(0);
          this.simulateKeyRelease(_playerKeys.left);
        }
        if (key === "up") {
          // player.sprite.body.setVelocityX(160);
          this.simulateKeyRelease(_playerKeys.up);
        }
        if (key === "right") {
          // player.sprite.body.setVelocityX(160);
          this.simulateKeyRelease(_playerKeys.right);
        }
        if (key === "down") {
          // player.sprite.body.setVelocityX(160);
          this.simulateKeyRelease(_playerKeys.down);
        }
        if (key === "x") {
          // player.sprite.body.setVelocityX(160);
          this.simulateKeyRelease(_playerKeys.x);
        }

        //   if (key == "up") {
        //       player.sprite.body.setVelocityY(0);
        //     }
      
      // player.state.setState("pos", {
      //   x: player.sprite.x,
      //   y: player.sprite.y,
      // });
    }
  }

  update(time: number, delta: number) {
    if (this.physics.world.isPaused) return
    const { animatedTiles, hud, mario, mario1, cursors, cursors1, enemyGroup, powerUpGroup } = this
    animatedTiles.update(delta)
    hud.update()



    // Example usage

    // setTimeout(() => {
    //   this.simulateKeyRelease(Phaser.Input.Keyboard.KeyCodes.UP);
    // },5000);

    
    // if () {
      
    if (this.players[0]){
      this.simulator(this.players[0],playerKeys[0]);
    }
    if (this.players[1]){
      this.simulator(this.players[1],playerKeys[1]);
    }
    // }

    
    
    mario.update(time, delta, cursors)
    // try {
    cursors1?.up &&
      cursors1?.down &&
        cursors1?.left &&
          cursors1?.right && mario1.update(time, delta, cursors1)

    // }catch(err){
    //   console.log("cursors1", cursors1)
    //   console.log(err)
    // }
    enemyGroup.update(time, delta, mario)
    powerUpGroup.update(time, delta, mario)
    powerUpGroup.update(time, delta, mario1)
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

  private brickColliderEnemy(brick: Brick, enemy: Enemy) {
    if (enemy.dead) return
    if (this.mario.powers.has(Large)) {
      enemy.die(true)
    }
  }

  /**
   * 创建道具
   * @param name 道具名
   */
  private createPowerUp(name: string, x: number, y: number) {
    const mario = this.mario
    const mario1 = this.mario1
    let params: any[] = []

    switch (name) {
      case 'mushroom':
        params = this.mario.powers.has(Large) || this.mario1.powers.has(Large) ? [Flower, [Fire, Large], { type: 'super' }] : [Mushroom, [Large], { type: 'super' }]
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
      console.log("createPowerUp")
      const powerUp = new PowerUp({ scene: this, x, y, texture: 'atlas', ...options }).overlap(
        this.mario,
        onOverlap || (() => {
          for (let i = 0; i < Power.length; i++) {
            // setTimeout(() => {
            // if (!this.mario.powers.has(Power[i])) {
              this.mario.powers.add(Power[i], (PowerClass) => new PowerClass(this.mario))
              //   }
          // }, 500*i)
          }
          
        })
      )

      const powerUp1 = new PowerUp({ scene: this, x, y, texture: 'atlas', ...options }).overlap(
        this.mario1,
        onOverlap || (() => {
          for (let i = 0; i < Power.length; i++) {
            // setTimeout(() => {
            //   if (!this.mario1.powers.has(Power[i])) {
                this.mario1.powers.add(Power[i], (PowerClass) => new PowerClass(this.mario1))
            //   }
            // }, 500*i)
          }
          
        })
      )

      this.powerUpGroup.add(powerUp)
      this.powerUpGroup.add(powerUp1)
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
    if (window.confirm('GameOver!')) {
      this.restartGame(false)
    }
  }
}
