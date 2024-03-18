import React from 'react'
import {useAppContext} from '../../contexts/context'

const Piece = ({rank, file, piece}) => {

  const {appState, dispatch} = useAppContext();
  const {turn, position} = appState;
  const currentPosition = position[position.length - 1]

  const getMoves = () => {
    const moves = []
    const player = piece[0]
    const ai = us === 'w' ? 'b' : 'w'
  }

  const onDragStart = e => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${piece},${rank},${7 - file}`);
    console.log(`${piece},${rank},${7 - file}`)
    setTimeout(() => {
      e.target.style.display = 'none';
    }, 0);
    if (turn === piece[0]) {
      const legalMoves = getMoves();
    }
  }

  const onDragEnd = e => {
    e.target.style.display = 'block';
  }

  return (
    <div className={`piece ${piece} p-${rank}${file}`} draggable={true} onDragStart={onDragStart}/>
  )
}

export default Piece