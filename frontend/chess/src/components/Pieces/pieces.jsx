import React, {useState, useRef} from 'react'
import Piece from '../Piece/piece'
import './pieces.css'
import { createPositions, copyPosition } from '../../helper'

const Pieces = () => {

    const [postion, setPosition] = useState(createPositions())

    const ref = useRef();

    const calculateCoords = e => {
        const {width, left, top} = ref.current.getBoundingClientRect()
        const size = width / 8;
        const y = Math.floor((e.clientX - left) / size)
        const x = 7 - Math.floor((e.clientY - top) / size)
        return {x,y}
    }

    const onDrop = e => {
        const newPosition = copyPosition(postion);
        const {x,y} = calculateCoords(e);
        const [piece, rank, file] = e.dataTransfer.getData('text').split(',');
        newPosition[rank][7 - file] = ""
        newPosition[x][7 - y] = piece;
        setPosition(newPosition);
    }

    const onDragOver = e => {
        e.preventDefault();
    }

    return (
        <div className='pieces' onDrop={onDrop} onDragOver={onDragOver} ref={ref}>
            {postion.map((r, rank) =>
                r.map((f, file) =>
                    postion[rank][file] ? <Piece rank={rank} file={file} piece={postion[rank][file]} key={`${rank}-${file}`}/> : null
                ))}
        </div>
    )
}

export default Pieces