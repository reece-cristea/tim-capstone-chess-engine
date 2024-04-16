import React from 'react'
import './board.css'
import { getCharacter } from '../../helper';
import Ranks from '../Ranks/ranks';
import Files from '../Files/files';
import Pieces from '../Pieces/pieces';
import { useAppContext } from '../../contexts/context';
import PopUp from '../PopUp/popup';
import arbiter from '../../arbiter/arbiter';
import { getKingPosition } from '../../arbiter/getMoves';
import Promotion from '../PopUp/Promotion/promotion';
import GameEnds from '../PopUp/GameEnds/gameEnds';


const Board = () => {
    const ranks = Array(8).fill().map((x, i) => 8 - i);
    const files = Array(8).fill().map((x, i) => i + 1);

    const { appState } = useAppContext();
    const position = appState.position[appState.position.length - 1];

    const isChecked = (() => {
        if (position) {
            const isInCheck = arbiter.isPlayerInCheck({
                positionAfterMove: position,
                player: appState.turn
            })
            if (isInCheck) {
                return getKingPosition(position, appState.turn);
            }
            return null
        }

    })()

    const getTileColor = (i, j) => {
        let c = 'tile'
        c += (i + j) % 2 === 0 ? ' tile--dark ' : ' tile--light '
        if (appState.legalMoves?.find(sq => sq[0] === i && sq[1] === j)) {
            if (position[i][j] === "") {
                c += ' empty';
            } else {
                c += ' attack';
            }
        }
        if (isChecked && isChecked[0] === i && isChecked[1] === j)
            c += ' checked'
        return c
    }


    return (
        <div className='board'>

            <Ranks ranks={ranks} />

            <div className='tiles'>
                {ranks.map((rank, i) =>
                    files.map((file, j) =>
                        <div key={rank + "-" + file} className={getTileColor(7 - i, j)} id={`${rank}${file}`}></div>
                    )
                )}
            </div>

            <Pieces />
            <PopUp>
                <Promotion />
                <GameEnds />
            </PopUp>

            <Files files={files} />
        </div>
    )
}

export default Board