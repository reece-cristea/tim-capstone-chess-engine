import React from 'react'
import './board.css'
import { getCharacter } from '../../helper';
import Ranks from '../Ranks/ranks';
import Files from '../Files/files';
import Pieces from '../Pieces/pieces';


const board = () => {
    const ranks = Array(8).fill().map((x, i) => 8 - i);
    const files = Array(8).fill().map((x, i) => i + 1);

    const getTileColor = (i, j) => {
        let c = 'tile'
        c += (i + j) % 2 === 0 ? ' tile--dark' : ' tile--light'
        return c
    }


    return (
        <div className='board'>

            <Ranks ranks={ranks} />
            
            <div className='tiles'>
                {ranks.map((rank, i) =>
                    files.map((file, j) =>
                        <div key={file + "-" + rank} className={getTileColor(9-i, j)}></div>
                    )
                )}    
            </div>
            
            <Pieces />
            
            <Files files={files} />
        </div>
    )
}

export default board