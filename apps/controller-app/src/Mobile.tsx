import "./snes.css";

import DeviceOrientation, { Orientation } from 'react-screen-orientation'
// @ts-nocheck
import {
  myPlayer,
  usePlayersList,
} from "playroomkit";

import rotateGif from "./assets/rotate.gif"
import { useEffect } from "react";

// import "./nes.css";

const TestingWasdController = ({ handleButtonPress }) => {
  return (
    <div>
      <button
        onMouseDown={() => handleButtonPress("up", "keyDown")}
        onMouseUp={() => handleButtonPress("up", "keyUp")}
      >
        Up
      </button>
      <button
        onMouseDown={() => handleButtonPress("down", "keyDown")}
        onMouseUp={() => handleButtonPress("down", "keyUp")}
      >
        Down
      </button>
      <button
        onMouseDown={() => handleButtonPress("left", "keyDown")}
        onMouseUp={() => handleButtonPress("left", "keyUp")}
      >
        Left
      </button>
      <button
        onMouseDown={() => handleButtonPress("right", "keyDown")}
        onMouseUp={() => handleButtonPress("right", "keyUp")}
      >
        Right
      </button>
    </div>
  );
};
const SnesController = ({ handleButtonPress }) => {
  return (
    <div>
    <div className="container" 
    // style={{
    //   transform: 'scale(1.5)'
    // }}
    >
      <div className="snes">
        <div className="left">
          <div className="pad">
            <div
              className="control top"
              //onMouseDown
              //onMouseUp
              onTouchStart={() => handleButtonPress("up", "keyDown")}
              onTouchEnd={() => handleButtonPress("up", "keyUp")}
            >
              <div className="arrow"></div>
            </div>
            <div
              className="control left"
              onTouchStart={() => handleButtonPress("left", "keyDown")}
              onTouchEnd={() => handleButtonPress("left", "keyUp")}
            >
              <div className="arrow"></div>
            </div>
            <div
              className="control right"
              onTouchStart={() => handleButtonPress("right", "keyDown")}
              onTouchEnd={() => handleButtonPress("right", "keyUp")}
            >
              <div className="arrow"></div>
            </div>
            <div
              className="control bottom"
              onTouchStart={() => handleButtonPress("down", "keyDown")}
              onTouchEnd={() => handleButtonPress("down", "keyUp")}
            >
              <div className="arrow"></div>
            </div>
            <div className="control middle"></div>
          </div>
        </div>
        <div className="middle">
          <div className="logo"></div>
          <div className="logo clone"></div>
          <div className="title"></div>
          <button className="select"></button>
          <button className="start"></button>
        </div>
        <div className="right">
          <div className="circle">
            <div className="group-1">
              <button className="green"></button>

              <button className="blue"
               onTouchStart={() => handleButtonPress("x", "keyDown")}
               onTouchEnd={() => handleButtonPress("x", "keyUp")}
 
              >
             
              </button>
            </div>
            <div className="group-2">
              <button className="yellow"></button>

              <button className="red"
              
              onTouchStart={() => handleButtonPress("up", "keyDown")}
              onTouchEnd={() => handleButtonPress("up", "keyUp")}
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      
</div>
</div>
  );
};
const NesController = ({ onKeyDown, onKeyUp }) => {};

function DirectionButtons() {
  const myPlayroomPlayer = myPlayer();
  const players = usePlayersList();

  console.log(players);

  const handleButtonPress = (key: string, event: string) => {
    myPlayroomPlayer.setState("keyPress", {
      key,
      event,
    }, true);
    console.log(myPlayroomPlayer.getState("keyPress"));
  };

  // useEffect(() => {
  //   alert("begin mobile")
  // }, [])

  return (
    <div>
      <DeviceOrientation lockOrientation={'landscape'}>
        {/* Will stay in DOM, but is only visible in portrait */}
        <Orientation orientation='portrait' alwaysRender={false}>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 99999,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00000050',
            backdropFilter: 'blur(4px)',
            color: 'white',
            fontFamily: '"Russo One", sans'
          }}>
            <img src={rotateGif} />
            <p>Please rotate your device</p>
          </div>
        </Orientation>
      </DeviceOrientation>
      {/* <TestingWasdController handleButtonPress={handleButtonPress} /> */}
      <SnesController handleButtonPress={handleButtonPress} />
    </div>
  );
}

export default DirectionButtons;
