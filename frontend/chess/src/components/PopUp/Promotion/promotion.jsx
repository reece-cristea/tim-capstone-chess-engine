import React from 'react'
import './promotion.css'
import { useAppContext } from '../../../contexts/context';
import { copyPosition } from '../../../helper';
import { clearLegalMoves } from '../../../reducer/actions/clearLegalMoves';
import { makeMove } from '../../../reducer/actions/move';

const Promotion = ({onClosePopUp}) => {
    const options = ['q', 'r', 'b', 'n'];
    const {appState, dispatch} = useAppContext();
    const {promotionSquare} = appState;
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

    const selectPromotionPiece = (option) => {
        onClosePopUp();
        const newPosition = copyPosition(appState.position[appState.position.length - 1]);
        console.log(promotionSquare.rank + " " + promotionSquare.file);
        newPosition[promotionSquare.rank][7 - promotionSquare.file] = '';
        newPosition[promotionSquare.x][promotionSquare.y] = `${color}${option}`;
        dispatch(clearLegalMoves());
        dispatch(makeMove({ newPosition }));
    }

  return (
    <div className='promotion-container promotion-choices' style={getPromotionBoxPosition()}>
        {options.map(option => <div key={option} className={`piece ${color}${option}`} onClick={() => selectPromotionPiece(option)}></div>)}
    </div>
  )
}

export default Promotion