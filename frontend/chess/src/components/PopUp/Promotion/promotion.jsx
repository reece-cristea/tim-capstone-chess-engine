import React from 'react'
import './promotion.css'
import { useAppContext } from '../../../contexts/context';
import { copyPosition, getAlgebraicNotation, reverseAlgebraicNotation } from '../../../helper';
import { clearLegalMoves } from '../../../reducer/actions/clearLegalMoves';
import { makeMove } from '../../../reducer/actions/move';
import { setPromotingPiece } from '../../../reducer/actions/setPromotion';
import arbiter from '../../../arbiter/arbiter';
import { checkmate } from '../../../reducer/actions/checkmate';
import { stalemate } from '../../../reducer/actions/stalemate';
import { detectInsufficientMaterials } from '../../../reducer/actions/insufficientMaterials';
import { detectThreefoldRepetition } from '../../../reducer/actions/threefold';
import { capturedPiece } from '../../../reducer/actions/capture';
import { getCastlingDirections } from '../../../arbiter/getMoves';
import { updateCastling } from '../../../reducer/actions/castle';

const Promotion = ({ onClosePopUp }) => {
    const options = ['q', 'r', 'b', 'n'];
    const { appState, dispatch } = useAppContext();
    const { promotionSquare } = appState;
    if (!promotionSquare) {
        return null;
    }
    const color = promotionSquare.x === 7 ? 'w' : 'b';

    const getPromotionBoxPosition = () => {
        const style = {}
        if (promotionSquare.x === 7) {
            style.top = '-12.5%'
        } else {
            style.top = '97.5%'
        }

        if (promotionSquare.y <= 0) {
            style.left = '0%'
        } else if (promotionSquare.y >= 6) {
            style.right = '0%'
        } else {
            style.left = `${12.5 * promotionSquare.y - 20}%`
        }
        return style
    }

    const updateCastlingState = (piece, rank, file) => {
        const direction = getCastlingDirections(appState.castleDirection, piece, Number(rank), 7 - Number(file))
        if (direction) {
            dispatch(updateCastling(direction))
        }
    }

    const aiMove = async (move, newPosition) => {
        let aiMove = null
        await fetch(`http://172.26.6.187:8000/move/${move}`).then((res) =>
            res.json().then((data) => {
                aiMove = data;
                aiMove = reverseAlgebraicNotation(aiMove)
                console.log(newPosition[aiMove.from.rank][aiMove.from.file])
                console.log(aiMove.from.rank)
                console.log(aiMove.from.file)
                console.log(aiMove.to.rank)
                console.log(aiMove.to.file)
                console.log(appState.status)

                if (newPosition[aiMove.to.rank][aiMove.to.file] && !newPosition[aiMove.to.rank][aiMove.to.file].startsWith(newPosition[aiMove.from.rank][aiMove.from.file][0])) {
                    const pieces = [...appState.capturedPieces, newPosition[aiMove.to.rank][aiMove.to.file]]
                    dispatch(capturedPiece(pieces))
                }

                const aiPlayer = newPosition[aiMove.from.rank][7 - aiMove.from.file].startsWith('w') ? 'b' : 'w';
                const aiCastleDirection = appState.castleDirection[`${newPosition[aiMove.from.rank][7 - aiMove.from.file].startsWith('w') ? 'b' : 'w'}`];
                if (newPosition[aiMove.from.rank][7 - aiMove.from.file].endsWith('r') || newPosition[aiMove.from.rank][7 - aiMove.from.file].endsWith('k')) {
                    updateCastlingState(newPosition[aiMove.from.rank][7 - aiMove.from.file], aiMove.from.rank, 7 - aiMove.from.file)
                }

                let posAfterAI = null
                if ((aiMove.from.rank === 7 && aiMove.from.file === 4) && (aiMove.to.rank === 7 && aiMove.to.file === 7)) {
                    posAfterAI = arbiter.performMove(newPosition, newPosition[aiMove.from.rank][aiMove.from.file], aiMove.from.rank, 7 - aiMove.from.file, aiMove.to.rank, 6)
                    dispatch(makeMove({ newPosition: posAfterAI }))
                } else if ((aiMove.from.rank === 7 && aiMove.from.file === 4) && (aiMove.to.rank === 7 && aiMove.to.file === 0)) {
                    posAfterAI = arbiter.performMove(newPosition, newPosition[aiMove.from.rank][aiMove.from.file], aiMove.from.rank, 7 - aiMove.from.file, aiMove.to.rank, 2)
                    dispatch(makeMove({ newPosition: posAfterAI }))
                } else {
                    posAfterAI = arbiter.performMove(newPosition, newPosition[aiMove.from.rank][aiMove.from.file], aiMove.from.rank, 7 - aiMove.from.file, aiMove.to.rank, aiMove.to.file)
                    dispatch(makeMove({ newPosition: posAfterAI }))
                }

                if (arbiter.isCheckmate(posAfterAI, aiPlayer, aiCastleDirection)) {
                    dispatch(checkmate(newPosition[aiMove.from.rank][7 - aiMove.from.file][0]))
                } else if (arbiter.isStalemate(posAfterAI, aiPlayer, aiCastleDirection)) {
                    dispatch(stalemate())
                } else if (arbiter.insufficientMaterials(posAfterAI)) {
                    dispatch(detectInsufficientMaterials())
                } else if (arbiter.threefoldRepetition(appState.position)) {
                    dispatch(detectThreefoldRepetition())
                }
            })
        )
        return aiMove
    }

    const selectPromotionPiece = (option) => {
        onClosePopUp();
        const newPosition = copyPosition(appState.position[appState.position.length - 1]);
        const currentPlayer = newPosition[promotionSquare.rank][7 - promotionSquare.file].startsWith('w') ? 'b' : 'w';
        const castleDirection = appState.castleDirection[`${newPosition[promotionSquare.rank][7 - promotionSquare.file].startsWith('w') ? 'b' : 'w'}`];
        
        newPosition[promotionSquare.rank][7 - promotionSquare.file] = '';
        newPosition[promotionSquare.x][promotionSquare.y] = `${color}${option}`;
        dispatch(setPromotingPiece(`${option}`))
        dispatch(clearLegalMoves());
        dispatch(makeMove({ newPosition }));

        if (arbiter.isCheckmate(newPosition, currentPlayer, castleDirection)) {
            dispatch(checkmate(newPosition[promotionSquare.rank][7 - promotionSquare.file][0]));
            return
        } else if (arbiter.isStalemate(newPosition, currentPlayer, castleDirection)) {
            dispatch(stalemate());
            return
        } else if (arbiter.insufficientMaterials(newPosition)) {
            dispatch(detectInsufficientMaterials());
            return
        } else if (arbiter.threefoldRepetition(appState.position)) {
            dispatch(detectThreefoldRepetition());
            return
        }
        dispatch(clearLegalMoves());
        console.log(`${getAlgebraicNotation(promotionSquare.rank, 7 - promotionSquare.file)}${getAlgebraicNotation(promotionSquare.x, promotionSquare.y)}${option}`);
        aiMove(`${getAlgebraicNotation(promotionSquare.rank, 7 - promotionSquare.file)}${getAlgebraicNotation(promotionSquare.x, promotionSquare.y)}${option}`, newPosition);

    }



    return (
        <div className='promotion-container promotion-choices' style={getPromotionBoxPosition()}>
            {options.map(option => <div key={option} className={`piece ${color}${option}`} onClick={() => selectPromotionPiece(option)}></div>)}
        </div>
    )
}

export default Promotion