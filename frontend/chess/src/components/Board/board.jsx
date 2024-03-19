import React from 'react'
import './board.css'
import { getCharacter } from '../../helper';
import Ranks from '../Ranks/ranks';
import Files from '../Files/files';
import Pieces from '../Pieces/pieces';
import { useAppContext } from '../../contexts/context';


const Board = () => {
    const ranks = Array(8).fill().map((x, i) => 8 - i);
    const files = Array(8).fill().map((x, i) => i + 1);

    const {appState} = useAppContext();
    const position = appState.position[appState.position.length - 1];

    const getTileColor = (i, j) => {
        let c = 'tile'
        c += (i + j) % 2 === 0 ? ' tile--dark ' : ' tile--light '
        if (appState.legalMoves?.find(sq => sq[0] === i && sq[1] === j)) {
            if(position[i][j] === ""){
                c += ' empty';
            } else {
                c+= 'attack';
            }
        }
        return c
    }


    return (
        <div className='board'>

            <Ranks ranks={ranks} />
            
            <div className='tiles'>
                {ranks.map((rank, i) =>
                    files.map((file, j) =>
                        <div key={rank + "-" + file} className={getTileColor(7-i, j)}></div>
                    )
                )}    
            </div>
            
            <Pieces />
            
            <Files files={files} />
        </div>
    )
}

export default Board