import React from 'react';
import ReactNipple from 'react-nipple';
// @ts-ignore
import { myPlayer } from 'playroomkit';
import { useState } from 'react';

const LeftAxis = ({ onButtonPress }) => {
  const [currentPosition, setCurrentPosition] = useState({
    x: 0,
    y: 0,
  });

  return (
    <ReactNipple
      options={{ 
        mode: 'semi',
        color:'white',
        position: {left: '50%', top: '50%'},
        catchDistance:'2',
        
    }}
      style={{
        outline:'2px red dotted',
        width: '100%',
        height: '100%',
      }}
      onMove={(evt, data) => {
        const angle = data.angle.radian;
        const dist = data.distance;
        const x = Number((Math.cos(angle) * dist / 50).toFixed(1));
        const y = Number((Math.sin(angle) * dist / 50).toFixed(1)) * -1;

        let toSend = {};
        if (currentPosition.x !== x) toSend.x = x;
        if (currentPosition.y !== y) toSend.y = y;
        if (Object.keys(toSend).length) {
          onButtonPress('axis-l', toSend);
          setCurrentPosition((oldVal) => ({ ...oldVal, ...toSend }));
        }
      }}
      onEnd={(evt, data) => {
        const x = 0;
        const y = 0;
        if (!(currentPosition.x === x && currentPosition.y === y)) {
          onButtonPress('axis-l', { x, y }, true);
          setCurrentPosition({ x, y });
        }
      }}
    />
  );
};

const RightAxis = ({ onButtonPress }) => {
  const [currentPosition, setCurrentPosition] = useState({
    x: 0,
    y: 0,
  });

  return (
    <ReactNipple
      options={{ 
        mode: 'dynamic', 
        // position: { top: '50%', left: '90%' },
        // catchDistance:'2'
    }}
      style={{
        width: '100%',
        height: '100%',
        // margin:'0px 0px 0px 50%',
        outline:'2px red dotted',
        background: '#0000ff20'
      }}
      onMove={(evt, data) => {
        const angle = data.angle.radian;
        const dist = data.distance;
        const x = Number((Math.cos(angle) * dist / 50).toFixed(3));
        const y = Number((Math.sin(angle) * dist / 50).toFixed(3)) * -1;

        let toSend = {};
        if (currentPosition.x !== x) toSend.x = x;
        if (currentPosition.y !== y) toSend.y = y;
        if (Object.keys(toSend).length) {
          onButtonPress('axis-r', toSend);
          setCurrentPosition((oldVal) => ({ ...oldVal, ...toSend }));
        }
      }}
      onEnd={(evt, data) => {
        const x = 0;
        const y = 0;
        if (!(currentPosition.x === x && currentPosition.y === y)) {
          onButtonPress('axis-r', { x, y }, true);
          setCurrentPosition({ x, y });
        }
      }}
    />
  );
};

const Button = ({ title, index, onButtonPress,color}) => {
  const buttonSize = '40px';
  

  return (
    <button
      style={{
        zIndex:4,
        width: buttonSize,
        height: buttonSize,
        backgroundColor: color,
        borderRadius: '50%',
        border: '2px solid #757575',
        outline: 'none',
        cursor: 'pointer',
        fontSize: '20px',
        margin:'0px 30px',
       
      }}
      onTouchStart={(evt) => {
        let toSend = {
          pressed: true,
        };
        if (Array.isArray(index)) {
          onButtonPress(`btn-${index.join(",")}`, toSend)
        }
        else {
          onButtonPress(`btn-${index}`, toSend);
        }
      }}
      onTouchEnd={(evt) => {
        let toSend = {
          pressed: false,
        };
        onButtonPress(`btn-${index}`, toSend, true);
      }}
    >
      {title || index}
    </button>
  );
};


  
const PubgController = () => {
  const myPlayroomPlayer = myPlayer();

  const handleButtonPress = (key, event, reliable = false) => {
    myPlayroomPlayer.setState('ctl', {
      key,
      event,
    }, reliable);
  };

  return (
    <>
    <div style={{display: 'flex', flexDirection: 'row', position: 'absolute', zIndex: 2, height: '100%', width: '100%'}}>
   <div style={{display: 'flex', height: '100%', flex: '0.5'}}>
      <LeftAxis onButtonPress={handleButtonPress}/>
   </div>
   
   <div style={{display: 'flex', height: '100%', flex: '0.5', opacity: 100}}>
      <RightAxis onButtonPress={handleButtonPress} />
   </div>
</div>

<div style={{display: 'flex', zIndex: 3000, flexDirection: 'row', position: 'absolute', top: 0, height: 'auto', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
    <Button title={"START"} index={9} onButtonPress={handleButtonPress} />
</div>

<div style={{
  display:'flex',
  flexDirection:'row',
  zIndex:0,
}}>

<div style={{
   display:'flex',
   flexDirection:'column',
   alignContent:'center',
   justifyContent:'center',
   
   width:'15vw',
   height:'10vh',
   margin:'18% 0 0 0'
}}>
<Button title={"Quick Fire"} index={7} onButtonPress={handleButtonPress} />
</div>

<div style={{
  margin:'0 0 0 35%',
  
  display:'flex',
  flexDirection:'row',
  height:'50vh',
  alignContent:'flex-end',
  
  

}}>


  <div style={{margin:'45% 0 0 10%',zIndex:'4',}}> <Button title={"Reload"} index={2} onButtonPress={handleButtonPress} /></div>
  
  <div style={{
    display:'flex',
    flexDirection:'column',
    alignContent:'flex-end',
    justifyContent:'flex-end',
    gap:'20px',
    margin:'20% 0 0 0 '
  }}>
    <Button title={"Fire"} index={[6,7]} onButtonPress={handleButtonPress} />
    <div style={{
      margin:'0 0 0 20%',
      zIndex:'4',
    }}><Button title={"Crouch"} index={1} onButtonPress={handleButtonPress} /></div>
  </div>

  <div style={{
    display:'flex',
    flexDirection:'column',
    alignContent:'center',
    justifyContent:'center',
    margin:'50% 0 0 0 ',
    gap:'20px'
  }}>
    <Button title={"Scope"} index={6} onButtonPress={handleButtonPress} />
    <Button title={"Jump"} index={0} onButtonPress={handleButtonPress} />
  </div>

 </div>
</div>
</>
    
  );
};

export default PubgController;