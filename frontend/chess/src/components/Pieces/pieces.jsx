import React, { useState, useRef } from 'react'
import Piece from '../Piece/piece'
import './pieces.css'
import { createPositions, copyPosition, getAlgebraicNotation, reverseAlgebraicNotation } from '../../helper'
import { useAppContext } from '../../contexts/context'
import { makeMove } from '../../reducer/actions/move'
import { clearLegalMoves } from '../../reducer/actions/clearLegalMoves'
import arbiter from '../../arbiter/arbiter'
import { openPromotion } from '../../reducer/actions/openPromotion'
import { updateCastling } from '../../reducer/actions/castle'
import { getCastlingDirections } from '../../arbiter/getMoves'
import { stalemate } from '../../reducer/actions/stalemate'
import { detectInsufficientMaterials } from '../../reducer/actions/insufficientMaterials'
import { detectThreefoldRepetition } from '../../reducer/actions/threefold'
import { checkmate } from '../../reducer/actions/checkmate'
import { capturedPiece } from '../../reducer/actions/capture'


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
        if (direction) {
            dispatch(updateCastling(direction))
        }
    }

    const move = e => {
        const { x, y } = calculateCoords(e);
        const [piece, rank, file] = e.dataTransfer.getData('text').split(',');

        if (currentPosition[x][y] && !currentPosition[x][y].startsWith(piece[0])){
            const pieces = [...appState.capturedPieces, currentPosition[x][y]]
            dispatch(capturedPiece(pieces))
        }

        if (appState.legalMoves.find(sq => sq[0] === x && sq[1] === y)) {
            const currentPlayer = piece.startsWith('w') ? 'b' : 'w';
            const castleDirection = appState.castleDirection[`${piece.startsWith('w') ? 'b' : 'w'}`];
            if ((piece === 'wp' && x === 7) || (piece === 'bp' && x === 0)){
                openPromotionBox(rank, file, x, y)
                return
            }
            if (piece.endsWith('r') || piece.endsWith('k')) {
                updateCastlingState(piece, rank, file)
            }
            const newPosition = arbiter.performMove(currentPosition, piece, rank, file, x, y);
            dispatch(makeMove({ newPosition }));

            if (arbiter.isCheckmate(newPosition, currentPlayer, castleDirection)) {
                dispatch(checkmate(piece[0]))
            } else if (arbiter.isStalemate(newPosition, currentPlayer, castleDirection)) {
                dispatch(stalemate())
            } else if (arbiter.insufficientMaterials(newPosition)) {
                dispatch(detectInsufficientMaterials())
            } else if (arbiter.threefoldRepetition(appState.position)) {
                dispatch(detectThreefoldRepetition())
            }

            let aiMove = null

            fetch(`http://127.0.0.1:5000/move/${getAlgebraicNotation(rank, 7 - file)}${getAlgebraicNotation(x, y)}`).then((res) =>
                res.json().then((data) => {
                    aiMove = data;
                    aiMove = reverseAlgebraicNotation(aiMove)
                    console.log('here')
                    const posAfterAI = arbiter.performMove(newPosition, newPosition[aiMove.from.rank][aiMove.from.file], aiMove.from.rank, aiMove.from.file, aiMove.to.rank, aiMove.to.file)
                    dispatch(makeMove({ posAfterAI }))
                    console.log('here2')
                })
            )
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