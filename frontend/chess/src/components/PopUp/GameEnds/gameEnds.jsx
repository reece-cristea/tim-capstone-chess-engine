import React from 'react'
import { useAppContext } from '../../../contexts/context';
import './gameEnds.css'
import {Status} from '../../../constant'
import { setupNewGame } from '../../../reducer/actions/newGame';

const GameEnds = ({ onClosePopUp }) => {
    const { appState : {status}, dispatch } = useAppContext();

    if (status === Status.ongoing || status === Status.promoting) {
        return null
    }

    const isWin = status.endsWith("wins!")

    const newGame = () => {
        dispatch(setupNewGame());
    }

    return (
        <div className='end-game'>
            <h1>
                {isWin ? status : 'Draw'}
            </h1>
            <p>{!isWin && status}</p>
            <div className={status}></div>
            <button onClick={(e) => {newGame()}}>New Game</button>
        </div>
    )
}

export default GameEnds