import React from 'react'
import {useAppContext} from '../../contexts/context'
import arbiter from '../../arbiter/arbiter';
import { showLegalMoves } from '../../reducer/actions/legalMoves';

const Piece = ({rank, file, piece}) => {

  const {appState, dispatch} = useAppContext();
  const {turn, position, castleDirection} = appState;
  const currentPosition = position[position.length - 1]

  const onDragStart = e => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${piece},${rank},${7 - file}`);
    setTimeout(() => {
      e.target.style.display = 'none';
    }, 0);
    if (turn === piece[0]) {
      const legalMoves = arbiter.getValidMoves({position: currentPosition, castleDirection: castleDirection[turn], previousPosition: position[position.length - 2], piece, rank, file});
      dispatch(showLegalMoves(legalMoves));
    }
  }

  const onDragEnd = e => {
    e.target.style.display = 'block';
  }

  return (
    <div className={`piece ${piece} p-${rank}${file}`} id={`p${rank}${file}`} draggable={true} onDragStart={onDragStart} onDragEnd={onDragEnd}/>
  )
}

export default Piece