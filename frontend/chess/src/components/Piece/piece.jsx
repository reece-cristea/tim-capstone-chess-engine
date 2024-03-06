import React from 'react'

const Piece = ({rank, file, piece}) => {

  const onDragStart = e => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${piece},${rank},${7 - file}`);
    console.log(`${piece},${rank},${7 - file}`)
    setTimeout(() => {
      e.target.style.display = 'none';
    }, 0);
  }

  return (
    <div className={`piece ${piece} p-${rank}${file}`} draggable={true} onDragStart={onDragStart}/>
  )
}

export default Piece