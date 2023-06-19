// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Game from './Game';
import Mobile from './Mobile';
import { onPlayerJoin, insertCoin, isHost, myPlayer } from "playroomkit";
import GameContainer from './ClassBasedGame';

const App: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isSdkLoading, setIsSdkLoading] = useState<boolean>(true);

  const initializeSdk = async (): Promise<void> => {
    setIsSdkLoading(true);
    try {
      await insertCoin();
      // if (!isMobile) {
      //   const game = new Phaser.Game(config);
      // }
    } catch (error) {
      console.log(error);
    }
    setIsSdkLoading(false);
  };

  useEffect(() => {
    initializeSdk();
  }, []);


  const hash = window.location.hash?.substring(1);


  useEffect(() => {
    console.log(hash); // Output: RB2HR
  }, [hash]);


  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 900);
      // console.log(`Screen size changed: ${window.innerWidth} x ${window.innerHeight}`);
    };

    

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isSdkLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Mobile />
    </div>
  );
};

export default App;
