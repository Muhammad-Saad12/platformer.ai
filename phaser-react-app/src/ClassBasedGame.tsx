// @ts-nocheck
import Phaser from "phaser";
import { onPlayerJoin, insertCoin, isHost, myPlayer } from "playroomkit";
import { useEffect, useRef } from "react";
import MainScene from './Mario/src/scripts/scenes/mainScene';
import PreloadScene from './Mario/src/scripts/scenes/preloadScene';

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 240;

class Main extends Phaser.Scene {
  controls: Record<string, any> = {};
  players: any[] = [];

  create(): void {
    // 1. Handle players joining and quitting.
    onPlayerJoin((playerState: any) => this.addPlayer(playerState));

    // 2. Pass player input to Playroom.
    // const joystick = nipplejs.create();
    // joystick.on("plain", (e, data) => {
    //   myPlayer().setState("dir", data.direction);
    // });
    // joystick.on("end", () => {
    //   myPlayer().setState("dir", undefined);
    // });
  }

  addPlayer(playerState: any): void {
    const sprite = this.add.rectangle(
      Phaser.Math.Between(100, 500),
      200,
      50,
      50,
      playerState.getProfile().color.hex
    );
    this.physics.add.existing(sprite, false);
    sprite.body.setCollideWorldBounds(true);
    this.players.push({
      sprite,
      state: playerState,
    });
    playerState.onQuit(() => {
      sprite.destroy();
      this.players = this.players.filter((p) => p.state !== playerState);
    });
  }

  update(): void {
    // 3. Pass your game state to Playroom.
    if (isHost()) {
      for (const player of this.players) {
        const { key, event } = player.state.getState("keyPress") || {};
        if (event === "keyDown") {
          if (key === "left") {
            player.sprite.body.setVelocityX(-160);
          } else if (key === "right") {
            player.sprite.body.setVelocityX(160);
          }
          if (key === "up" && player.sprite.body.onFloor()) {
            player.sprite.body.setVelocityY(-330);
          }
        } else if (event === "keyUp") {
          if (key === "left" || key === "right") {
            player.sprite.body.setVelocityX(0);
          }
          //   if (key == "up") {
          //       player.sprite.body.setVelocityY(0);
          //     }
        }
        player.state.setState("pos", {
          x: player.sprite.x,
          y: player.sprite.y,
        });
      }
    } else {
      for (const player of this.players) {
        const pos = player.state.getState("pos");
        if (pos) {
          player.sprite.x = pos.x;
          player.sprite.y = pos.y;
        }
      }
    }
  }
}

export const GameContainer = (): JSX.Element => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      backgroundColor: '#6888ff',
      render: {
        pixelArt: true,
        roundPixels: true,
      },
      scale: {
        parent: 'phaser-game',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      },
      scene: [PreloadScene, MainScene],
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          gravity: { y: 650 },
        },
      },
    };
    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <>
      <>hello from mario</>
      <div
        ref={gameContainerRef}
        style={{
          width: "100%",
          height: "100vh",
        }}
        id="my-game"
      />
    </>
  );
};

export default GameContainer;
