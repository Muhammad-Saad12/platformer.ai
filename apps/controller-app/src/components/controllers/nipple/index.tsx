// optional: include the stylesheet somewhere in your app
import 'react-nipple/lib/styles.css';

import ReactNipple from 'react-nipple';
// @ts-ignore
import { myPlayer } from 'playroomkit';
import { useState } from 'react';

const LeftAxis = ({onButtonPress}) => {
    const [currentPosition, setCurrentPosition] = useState({
        x: 0, 
        y: 0,
    })
  
    return (
<ReactNipple
            // supports all nipplejs options
            // see https://github.com/yoannmoinet/nipplejs#options
            options={{ mode: 'static', position: { top: '50%', left: '50%' } }}
            // any unknown props will be passed to the container element, e.g. 'title', 'style' etc
            style={{
                outline: '1px dashed red',
                width: 150,
                height: 150
                // if you pass position: 'relative', you don't need to import the stylesheet
            }}
            // all events supported by nipplejs are available as callbacks
            // see https://github.com/yoannmoinet/nipplejs#start
            onMove={(evt, data) => {
                // console.log(evt, data)
                const angle = data.angle.radian
                const dist = data.distance
                const x = Number(((Math.cos(angle) * dist) / 50)
                .toFixed(1))
                const y = Number(((Math.sin(angle) * dist) / 50).toFixed(1)) * (-1)
                
                // console.log("x, y", x, y)

                let toSend:any = {};
                if (currentPosition.x !== x) toSend.x = x
                if (currentPosition.y !== y) toSend.y = y
                if (Object.keys(toSend).length) {
                    onButtonPress('axis-l', toSend)
                    setCurrentPosition(oldVal => ({...oldVal, ...toSend}))
                }
            }}
            onEnd={(evt, data) => {
                const x = 0;
                const y = 0;
                if (!(currentPosition.x === x && currentPosition.y === y)) {
                    onButtonPress('axis-l', {
                        x, 
                        y,
                    }, true)
                    setCurrentPosition({x, y})
                }
            }}
        />
    )
}

const RightAxis = ({onButtonPress}) => {
    const [currentPosition, setCurrentPosition] = useState({
        x: 0, 
        y: 0,
    })
  
    return (
<ReactNipple
            // supports all nipplejs options
            // see https://github.com/yoannmoinet/nipplejs#options
            options={{ mode: 'static', position: { top: '50%', left: '50%' } }}
            // any unknown props will be passed to the container element, e.g. 'title', 'style' etc
            style={{
                outline: '1px dashed red',
                width: 150,
                height: 150
                // if you pass position: 'relative', you don't need to import the stylesheet
            }}
            // all events supported by nipplejs are available as callbacks
            // see https://github.com/yoannmoinet/nipplejs#start
            onMove={(evt, data) => {
                // console.log(evt, data)
                const angle = data.angle.radian
                const dist = data.distance
                const x = Number(((Math.cos(angle) * dist) / 50)
                .toFixed(3))
                const y = Number(((Math.sin(angle) * dist) / 50).toFixed(3)) * (-1)
                
                // console.log("x, y", x, y)

                let toSend:any = {};
                if (currentPosition.x !== x) toSend.x = x
                if (currentPosition.y !== y) toSend.y = y
                if (Object.keys(toSend).length) {
                    onButtonPress('axis-r', toSend)
                    setCurrentPosition(oldVal => ({...oldVal, ...toSend}))
                }
            }}
            onEnd={(evt, data) => {
                const x = 0;
                const y = 0;
                if (!(currentPosition.x === x && currentPosition.y === y)) {
                    onButtonPress('axis-r', {
                        x, 
                        y,
                    }, true)
                    setCurrentPosition({x, y})
                }
            }}
        />
    )
}

const Button = ({onButtonPress}) => {
    return (
        <button style={{
            width: '10rem',
            height: '10rem'
        }}
                    // all events supported by nipplejs are available as callbacks
            // see https://github.com/yoannmoinet/nipplejs#start
            onTouchStart={(evt) => {
                let toSend:any = {
                    pressed: true,
                };
                onButtonPress('btn-0', toSend)
            }}
            onTouchEnd={(evt) => {
                let toSend:any = {
                    pressed: false,
                };
                onButtonPress('btn-0', toSend, true)
            }}
        
        >0</button>
    )
}

const NippleController = () => {
    const myPlayroomPlayer = myPlayer();

    const handleButtonPress = (key: string, event: object, reliable=false) => {
      myPlayroomPlayer.setState("ctl", {
        key,
        event,
      }, reliable);
    };
    
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100vw',
            justifyContent: 'space-between',
        }}>
        <LeftAxis onButtonPress={handleButtonPress}/>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '5px'
        }}>
        <Button onButtonPress={handleButtonPress} />
        <button style={{
            width: '10rem',
            height: '10rem'
        }}>1</button>
        <button style={{
            width: '10rem',
            height: '10rem'
        }}>2</button>
        <button style={{
            width: '10rem',
            height: '10rem'
        }}>3</button>
        </div>
        <RightAxis onButtonPress={handleButtonPress} />
    </div>
    )
}

export default NippleController;