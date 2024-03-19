import React, { useState, useRef } from 'react'
import Piece from '../Piece/piece'
import './pieces.css'
import { createPositions, copyPosition } from '../../helper'
import { useAppContext } from '../../contexts/context'
import { makeMove } from '../../reducer/actions/move'
import { clearLegalMoves } from '../../reducer/actions/clearLegalMoves'

const Pieces = () => {

    const { appState, dispatch } = useAppContext();
    const currentPosition = appState.position[appState.position.length - 1];

    const ref = useRef();

    const calculateCoords = e => {
        const { width, left, top } = ref.current.getBoundingClientRect()
        const size = width / 8;
        const y = Math.floor((e.clientX - left) / size)
        const x = 7 - Math.floor((e.clientY - top) / size)
        return { x, y }
    }

    const onDrop = e => {
        const newPosition = copyPosition(currentPosition);
        const { x, y } = calculateCoords(e);
        const [piece, rank, file] = e.dataTransfer.getData('text').split(',');

        if (appState.legalMoves?.find(sq => sq[0] === x && sq[1] === y)) {
            newPosition[rank][7 - file] = "";
            newPosition[x][y] = piece;
            dispatch(makeMove({ newPosition }));
        }

        dispatch(clearLegalMoves())
    }

    const onDragOver = e => {
        e.preventDefault();
    }

    return (
        <div className='pieces' onDrop={onDrop} onDragOver={onDragOver} ref={ref}>
            {currentPosition.map((r, rank) =>
                r.map((f, file) =>
                    currentPosition[rank][file] ? <Piece rank={rank} file={file} piece={currentPosition[rank][file]} key={`${rank}-${file}`} /> : null
                ))}
        </div>
    )
}

export default Pieces