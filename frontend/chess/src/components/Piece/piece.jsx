import React from 'react'
import {useAppContext} from '../../contexts/context'

const Piece = ({rank, file, piece}) => {

  const {appState, dispatch} = useAppContext();
  const {turn, position} = appState;
  const currentPosition = position[position.length - 1]

  const getMoves = () => {
    const moves = [];
    const player = piece[0];
    const ai = player === 'w' ? 'b' : 'w';

    const direction = [
      [-1,0],
      [1,0],
      [0,-1],
      [0,1]
    ];

    direction.forEach(dir => {
      for (let i = 1; i < 8; i++) {
        const x = rank + (i*dir[0])
        const y = file + (i*dir[1])
        if(currentPosition?.[x]?.[y] === undefined) 
          break
        if(currentPosition[x][y].startsWith(ai)) {
          moves.push([x,y])
          break
        }
        if(currentPosition[x][y].startsWith(player)) {
          break
        }
        moves.push([x,y])
      }
    })
    return moves;
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
      console.log(legalMoves);
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