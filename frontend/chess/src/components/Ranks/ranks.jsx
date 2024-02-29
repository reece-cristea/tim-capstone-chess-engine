import React from 'react'
import './ranks.css'

const Ranks = ({ranks}) => {
  return (
    <div className='ranks'>
        {ranks.map(rank => <span key={rank}>{rank}</span>)}
    </div>
  )
}

export default Ranks