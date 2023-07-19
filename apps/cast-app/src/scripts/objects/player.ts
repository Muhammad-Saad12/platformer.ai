import { PowerManage } from '../powers'
import { Enemy } from '../objects/enemies'
import { lives } from '../helpers/decorators'

type Config = {
  scene: Phaser.Scene
  x: number
  y: number
  texture: string
  frame: string
  // player abilities
  allowPowers: Function[]
}

/**
 * player
 */
export default class Player extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body
  /**
   * capacity management
   */
  powers: PowerManage
  /**
   * die condition
   */
  dead = false
  /**
   * is protected ?
   */
  protected = false
  /**
   * Player animation cycle suffix
   */
  animSuffix = ''

  constructor({ scene, x, y, texture, frame, allowPowers }: Config) {
    super(scene, x, y, texture, frame)
    scene.physics.world.enable(this)
    scene.add.existing(this)
    this.body.setSize(8, 16)
    this.makeAnimaions()
    this.powers = new PowerManage(this, allowPowers)
  }

  /**
   * Create animations for players in various states such as walking and jumping
   */
  private makeAnimaions() {
    const config = {
      frameRate: 10,
      repeat: -1,
      repeatDelay: 0,
    }

    // Mario animations: One without suffix, super after mushroom and fire after flower
    ;['', 'Super', 'Fire'].forEach((suffix: string) => {
      this.anims.create({
        key: 'run' + suffix,
        frames: this.anims.generateFrameNames('atlas', {
          prefix: 'mario/walk' + suffix,
          start: 1,
          end: 3,
        }),
        ...config,
      })

      // Jump, Stand and Turn: one frame each
      ;['jump', 'stand', 'turn', 'bend'].forEach((anim) => {
        if (anim === 'bend' && suffix === '') {
          // No bend animation when Mario is small
          return
        }
        this.anims.create({
          key: anim + suffix,
          frames: [
            {
              frame: 'mario/' + anim + suffix,
              key: 'atlas',
            },
          ],
          ...config,
        })
      })

      // Climb
      this.anims.create({
        key: 'climb' + suffix,
        frames: this.anims.generateFrameNames('atlas', {
          prefix: 'mario/climb' + suffix,
          start: 0,
          end: 1,
        }),
        ...config,
      })

      // Swim
      this.anims.create({
        key: 'swim' + suffix,
        frames: this.anims.generateFrameNames('atlas', {
          prefix: 'mario/swim' + suffix,
          start: 1,
          end: 5,
        }),
        ...config,
      })
    })

    const growFrames = [
      'mario/half',
      'mario/stand',
      'mario/half',
      'mario/standSuper',
      'mario/half',
      'mario/standSuper',
    ].map((frame) => ({ frame, key: 'atlas' }))

    this.anims.create({
      key: 'grow',
      frames: growFrames,
      frameRate: 10,
      repeat: 0,
      repeatDelay: 0,
    })

    this.anims.create({
      key: 'shrink',
      frames: growFrames.reverse(),
      frameRate: 10,
      repeat: 0,
      repeatDelay: 0,
    })

    this.anims.create({
      key: 'dead',
      frames: [{ frame: 'mario/dead', key: 'atlas' }],
      frameRate: 1,
      repeat: -1,
    })

    // fire
    this.anims.create({
      key: 'fire',
      frames: this.anims.generateFrameNames('atlas', {
        prefix: 'mario/walkFire',
        start: 1,
        end: 1,
      }),
    })
  }

  update(time: number, delta: number, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (this.dead) return

    this.powers.allowPowers.some((name) => this.powers.get(name)?.update?.(time, delta, this, cursors))

    // Dies if out of view of the map
    if (this.x < 0 || this.y > this.scene.sys.game.canvas.height) {
      this.die()
    }
  }

  /**
   * when die
   */
  @lives(-1)
  die() {
    this.dead = true
    this.scene.sound.stopAll()
    this.scene.sound.playAudioSprite('sfx', 'smb_mariodie')
    this.body.checkCollision.none = true
    this.body.setAcceleration(0, 0).setVelocity(0, -200)
    this.anims.play('dead')
    this.emit('die')
  }

  /**
   * 接触敌人时调用该方法
   * @param enemy 敌人
   * @param stepOnEnemy 玩家是否踩到敌人
   */
  overlapEnemy(enemy: Enemy, stepOnEnemy: boolean) {
    return this.powers.allowPowers.some((name) => this.powers.get(name)?.overlapEnemy?.(this, enemy, stepOnEnemy))
  }

  /**
   * 接触地图时调用该方法
   * @param tile tile
   */
  colliderWorld(tile: Phaser.Tilemaps.Tile) {
    return this.powers.allowPowers.some((name) => this.powers.get(name)?.colliderWorld?.(this, tile))
  }
  // colliderWorld(tile: Phaser.Tilemaps.Tile) {
  //   return this.powers.allowPowers.some((name) => this.powers.get(name)?.colliderWorld?.(this, tile));
  // }

  
}
