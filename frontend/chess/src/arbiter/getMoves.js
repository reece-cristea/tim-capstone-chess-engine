export const getRookMoves = (position, piece, rank, file) => {
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
        if(position?.[x]?.[y] === undefined) 
          break
        if(position[x][y].startsWith(ai)) {
          moves.push([x,y])
          console.log("here" + x + y)
          break
        }
        if(position[x][y].startsWith(player)) {
          console.log("here" + x + y)
          break
        }
        moves.push([x,y])
      }
    })
    return moves;
  }

export const getKnightMoves = (position, rank, file) => {
  const moves = []
  const ai = position[rank][file].startsWith('w') ? 'b' : 'w';

  const legalSquares = [
    [-2, 1],
    [2, 1],
    [-2, -1],
    [2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2]
  ]

  legalSquares.forEach(sq => {
    const square = position?.[rank + sq[0]]?.[file + sq[1]];
    if (square !== undefined && (square.startsWith(ai) || square === '')) {
      moves.push([rank + sq[0], file + sq[1]]);
    }
  })

  return moves
}

export const getBishopMoves = (position, piece, rank, file) => {
  const moves = [];
  const player = piece[0];
  const ai = player === 'w' ? 'b' : 'w';

  const direction = [
    [-1,1],
    [1,1],
    [-1,-1],
    [1,-1]
  ];

  direction.forEach(dir => {
    for (let i = 1; i < 8; i++) {
      const x = rank + (i*dir[0])
      const y = file + (i*dir[1])
      if(position?.[x]?.[y] === undefined) 
        break
      if(position[x][y].startsWith(ai)) {
        moves.push([x,y])
        console.log("here" + x + y)
        break
      }
      if(position[x][y].startsWith(player)) {
        console.log("here" + x + y)
        break
      }
      moves.push([x,y])
    }
  })
  return moves;
}

export const getQueenMoves = (position, piece, rank, file) => {
  const moves = [];
  const player = piece[0];
  const ai = player === 'w' ? 'b' : 'w';

  const direction = [
    [-1,1],
    [1,1],
    [-1,-1],
    [1,-1],
    [-1,0],
    [1,0],
    [0,-1],
    [0,1]
  ];

  direction.forEach(dir => {
    for (let i = 1; i < 8; i++) {
      const x = rank + (i*dir[0])
      const y = file + (i*dir[1])
      if(position?.[x]?.[y] === undefined) 
        break
      if(position[x][y].startsWith(ai)) {
        moves.push([x,y])
        console.log("here" + x + y)
        break
      }
      if(position[x][y].startsWith(player)) {
        console.log("here" + x + y)
        break
      }
      moves.push([x,y])
    }
  })
  return moves;
}

export const getKingMoves = (position, piece, rank, file) => {
  const moves = [];
  const player = piece[0];
  const ai = player === 'w' ? 'b' : 'w';

  const direction = [
    [-1,1],
    [1,1],
    [-1,-1],
    [1,-1],
    [-1,0],
    [1,0],
    [0,-1],
    [0,1]
  ];

  direction.forEach(dir => {
      const x = rank + dir[0]
      const y = file + dir[1]
      if(position?.[x]?.[y] !== undefined && (!position[x][y].startsWith(player) || position[x][y].startsWith(ai))) {
        moves.push([x,y])
      }
  })
  return moves;
}

export const getPawnMoves = (position, piece, rank, file) => {
  const moves = []
  const direction = piece === 'wp' ? 1 : -1
  const player = piece[0];
  const ai = player === 'w' ? 'b' : 'w'

  if (!position?.[rank + direction]?.[file]) {
    moves.push([rank + direction,file])
  }

  if (rank % 5 === 1) {
    if (position?.[rank + direction]?.[file] === '' && position?.[rank + direction + direction]?.[file] === '') {
      moves.push([rank + direction + direction,file])
    }
  }

  if (position?.[rank + direction]?.[file + 1].startsWith(ai)) {
    moves.push([rank + direction,file + 1])
  }

  if (position?.[rank + direction]?.[file - 1].startsWith(ai)) {
    moves.push([rank + direction,file - 1])
  }

  return moves
}