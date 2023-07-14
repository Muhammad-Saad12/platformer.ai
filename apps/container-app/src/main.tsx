import { render } from 'preact'
import './index.css'
import { RouterProvider, createBrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'preact/hooks'

const Game = () => {
    const theme = useLocation().state

    return (
        <div>
            <h1>Your theme is : {theme} !</h1>
            <iframe src="http://localhost:9000/" width={1000} height={500} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture full"></iframe>
        </div>
    )
}

const Title = () => {

    const navigate = useNavigate()

    const [theme, setTheme] = useState("anime")

    const submit = () => {
        navigate('/game', {state : theme})
    }

    return (
        <div>
            <h1>Welcome to Platformer.ai</h1>
            <h2>Choose your theme</h2>
            <select onChange={(e) => setTheme(e.target?.value)}>
                <option value="anime">Anime</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="steampunk">Steampunk</option>
            </select>
            <br />
            <button onClick={submit}>Let's go !</button>
        </div>
    )
}


const router = createBrowserRouter([{
    path: "/",
    element: <Title />
}, {
    path: "/game",
    element: <Game />
}])

render(<RouterProvider router={router} />, document.getElementById('app')!)
