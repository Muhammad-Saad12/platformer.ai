// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { onPlayerJoin, insertCoin, isHost, myPlayer } from "playroomkit";

const Game: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameContainerRef.current!,
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    const game = new Phaser.Game(config);

    function preload(this: Phaser.Scene): void {
      // Add your preload logic here
    }

    function addPlayer(this: Phaser.Scene, playerState: any): void {
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
        state: playerState
      });
      playerState.onQuit(() => {
        sprite.destroy();
        this.players = this.players.filter((p: any) => p.state !== playerState);
      });
    }

    function create(this: Phaser.Scene): void {
      // 1. Handle players joining and quitting.
      onPlayerJoin((playerState: any) => this.addPlayer(playerState));
      const text = this.add.text(400, 300, 'Hello From Laptop', { fontSize: '32px', fill: '#FFFFFF' });
      text.setOrigin(0.5);
    }

    function update(this: Phaser.Scene): void {
      // Add your update logic here
      // 3. Pass your game state to Playroom.
      if (isHost()) {
        for (const player of this.players) {
          const controls = player.state.getState("dir") || {};
          if (controls.x === "left") {
            player.sprite.body.setVelocityX(-160);
          } else if (controls.x === "right") {
            player.sprite.body.setVelocityX(160);
          } else {
            player.sprite.body.setVelocityX(0);
          }
      
          if (controls.y === "up" && player.sprite.body.onFloor()) {
            player.sprite.body.setVelocityY(-330);
          }
          player.state.setState("pos", {
            x: player.sprite.x,
            y: player.sprite.y,
          });
        }
      }
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameContainerRef}></div>;
};

export default Game;
