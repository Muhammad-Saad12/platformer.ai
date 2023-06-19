// @ts-nocheck
import Phaser from "phaser";
import { onPlayerJoin, insertCoin, isHost, myPlayer } from "playroomkit";
import { useEffect, useRef } from "react";

class Main extends Phaser.Scene {
  controls: any = {};
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

export const GameContainer: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 300,
      height: 480,
      parent: gameContainerRef.current!,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 700 },
        },
      },
      scene: Main,
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <>
      <div>Hello world</div>
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
