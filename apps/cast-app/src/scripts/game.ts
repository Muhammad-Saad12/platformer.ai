import 'phaser'

import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'
// @ts-ignore
import { insertCoin } from "playroomkit";

//400
const DEFAULT_WIDTH = 400
const DEFAULT_HEIGHT = 240

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
    
    width:  DEFAULT_WIDTH,
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
}


window.addEventListener('load', async () => {
  try {
    await insertCoin({
      streamMode:true, 
      baseUrl: process.env.NODE_ENV==="development" ? 'http://localhost:3000/' : undefined
    });
  }
  catch(err){
    console.log("There was an error while insertingCoin:", err);   
  }
  const game = new Phaser.Game(config);
})
