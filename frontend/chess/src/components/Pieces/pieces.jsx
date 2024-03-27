import React, { useState, useRef } from 'react'
import Piece from '../Piece/piece'
import './pieces.css'
import { createPositions, copyPosition } from '../../helper'
import { useAppContext } from '../../contexts/context'
import { makeMove } from '../../reducer/actions/move'
import { clearLegalMoves } from '../../reducer/actions/clearLegalMoves'
import arbiter from '../../arbiter/arbiter'
import { openPromotion } from '../../reducer/actions/openPromotion'
import { updateCastling } from '../../reducer/actions/castle'
import { getCastlingDirections } from '../../arbiter/getMoves'


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

    const openPromotionBox = (rank, file, x, y) => {
        dispatch(openPromotion(Number(rank), Number(file), x, y))
    }

    const updateCastlingState = (piece, rank, file) => {
        const direction = getCastlingDirections(appState.castleDirection,piece, Number(rank), 7 - Number(file))
        console.log(direction);
        if (direction) {
            dispatch(updateCastling(direction))
        }
    }

    const move = e => {
        const { x, y } = calculateCoords(e);
        const [piece, rank, file] = e.dataTransfer.getData('text').split(',');

        if (appState.legalMoves.find(sq => sq[0] === x && sq[1] === y)) {
            if ((piece === 'wp' && x === 7) || (piece === 'bp' && x === 0)){
                openPromotionBox(rank, file, x, y)
                return
            }
            if (piece.endsWith('r') || piece.endsWith('k')) {
                updateCastlingState(piece, rank, file)
            }
            const newPosition = arbiter.performMove(currentPosition, piece, rank, file, x, y);
            dispatch(makeMove({ newPosition }));
        }

        dispatch(clearLegalMoves())
    }

    const onDrop = e => {
       e.preventDefault()
       move(e)
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