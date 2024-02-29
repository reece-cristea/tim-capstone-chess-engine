import React from 'react'
import Piece from '../Piece/piece'
import './pieces.css'

const Pieces = () => {

    const postion = new Array(8).fill('').map(x => new Array(8).fill(''))
    postion[0][0] = 'wr'
    postion[0][1] = 'wn'
    postion[0][2] = 'wb'
    postion[0][3] = 'wk'
    postion[0][4] = 'wq'
    postion[0][5] = 'wb'
    postion[0][6] = 'wn'
    postion[0][7] = 'wr'
    postion[7][0] = 'br'
    postion[7][1] = 'bn'
    postion[7][2] = 'bb'
    postion[7][3] = 'bk'
    postion[7][4] = 'bq'
    postion[7][5] = 'bb'
    postion[7][6] = 'bn'
    postion[7][7] = 'br'
    postion[1][0] = 'wp'
    postion[1][1] = 'wp'
    postion[1][2] = 'wp'
    postion[1][3] = 'wp'
    postion[1][4] = 'wp'
    postion[1][5] = 'wp'
    postion[1][6] = 'wp'
    postion[1][7] = 'wp'
    postion[6][0] = 'bp'
    postion[6][1] = 'bp'
    postion[6][2] = 'bp'
    postion[6][3] = 'bp'
    postion[6][4] = 'bp'
    postion[6][5] = 'bp'
    postion[6][6] = 'bp'
    postion[6][7] = 'bp'


    return (
        <div className='pieces'>
            {postion.map((r, rank) =>
                r.map((f, file) =>
                    postion[rank][file] ? <Piece rank={rank} file={file} piece={postion[rank][file]} key={`${rank}-${file}`}/> : null
                ))}
        </div>
    )
}

export default Pieces