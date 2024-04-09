import React from 'react'
import './capturedPieces.css'
import { useAppContext } from '../../contexts/context';

const CapturedPieces = ({ color }) => {

  const { appState } = useAppContext();
  const { capturedPieces } = appState;


  return (
    <div className='captured-piece-container'>
      {capturedPieces.map(piece => {
        if (piece[0] === color) {
          return <div><img className={`captured-piece`} src={`https://tim-capstone-chess-engine.s3.us-west-1.amazonaws.com/piece_pictures/${piece}.png`} /></div>
        }
      })}
    </div>
  )
}

export default CapturedPieces