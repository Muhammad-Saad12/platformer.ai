// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import Mobile from './Mobile';
import NippleController from './components/controllers/nipple';
import { insertCoin } from "playroomkit";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Mobile />,
  },
  {
    path: "/nipple",
    element: <NippleController />,
  },
]);

const App: React.FC = () => {
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

  const [isKicked] = useMyPlayer("isKicked")

  useEffect(() => {
    // disconnect SDK ?
    if (isKicked){
      window.location.hash = '';
      window.location.reload()
    }
  }, [isKicked])


  const hash = window.location.hash?.substring(1);


  useEffect(() => {
    console.log(hash); // Output: RB2HR
  }, [hash]);


  // useEffect(() => {
  //   const handleResize = (): void => {
  //     setIsMobile(window.innerWidth < 900);
  //     // console.log(`Screen size changed: ${window.innerWidth} x ${window.innerHeight}`);
  //   };

    

  //   handleResize();

  //   window.addEventListener('resize', handleResize);

  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);

  if (isSdkLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
