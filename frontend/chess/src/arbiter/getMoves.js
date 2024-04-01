import arbiter from "./arbiter";

export const getRookMoves = (position, piece, rank, file) => {
  const moves = [];
  const player = piece[0];
  const ai = player === 'w' ? 'b' : 'w';

  const direction = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ];

  direction.forEach(dir => {
    for (let i = 1; i < 8; i++) {
      const x = rank + (i * dir[0])
      const y = file + (i * dir[1])
      if (position?.[x]?.[y] === undefined)
        break
      if (position[x][y].startsWith(ai)) {
        moves.push([x, y])
        break
      }
      if (position[x][y].startsWith(player)) {
        break
      }
      moves.push([x, y])
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
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1]
  ];

  direction.forEach(dir => {
    for (let i = 1; i < 8; i++) {
      const x = rank + (i * dir[0])
      const y = file + (i * dir[1])
      if (position?.[x]?.[y] === undefined)
        break
      if (position[x][y].startsWith(ai)) {
        moves.push([x, y])
        break
      }
      if (position[x][y].startsWith(player)) {
        break
      }
      moves.push([x, y])
    }
  })
  return moves;
}

export const getQueenMoves = (position, piece, rank, file) => {
  const moves = [];
  const player = piece[0];
  const ai = player === 'w' ? 'b' : 'w';

  const direction = [
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ];

  direction.forEach(dir => {
    for (let i = 1; i < 8; i++) {
      const x = rank + (i * dir[0])
      const y = file + (i * dir[1])
      if (position?.[x]?.[y] === undefined)
        break
      if (position[x][y].startsWith(ai)) {
        moves.push([x, y])
        break
      }
      if (position[x][y].startsWith(player)) {
        break
      }
      moves.push([x, y])
    }
  })
  return moves;
}

export const getKingMoves = (position, piece, rank, file) => {
  const moves = [];
  const player = piece[0];
  const ai = player === 'w' ? 'b' : 'w';

  const direction = [
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ];

  direction.forEach(dir => {
    const x = rank + dir[0]
    const y = file + dir[1]
    if (position?.[x]?.[y] !== undefined && (!position[x][y].startsWith(player) || position[x][y].startsWith(ai))) {
      moves.push([x, y])
    }
  })
  return moves;
}

export const getPawnMoves = (position, piece, rank, file) => {
  const moves = []
  const direction = piece === 'wp' ? 1 : -1
  const player = piece[0];

  if (!position?.[rank + direction]?.[file]) {
    moves.push([rank + direction, file])
  }

  if (rank % 5 === 1) {
    if (position?.[rank + direction]?.[file] === '' && position?.[rank + direction + direction]?.[file] === '') {
      moves.push([rank + direction + direction, file])
    }
  }

  return moves
}

export const getPawnCaptures = (position, previousPosition, piece, rank, file) => {
  const moves = []
  const direction = piece === 'wp' ? 1 : -1
  const player = piece[0];
  const ai = player === 'w' ? 'b' : 'w'

  if (position?.[rank+direction]?.[file-1] && position[rank+direction][file-1].startsWith(ai)) {
    moves.push([rank + direction, file - 1])
  }

  if (position?.[rank+direction]?.[file+1] && position[rank+direction][file+1].startsWith(ai)) {
    moves.push([rank + direction, file + 1])
  }

  const aiPawn = direction === 1 ? 'bp' : 'wp'
  const adjacentFiles = [file - 1, file + 1]
  if (previousPosition) {
    if ((direction === 1 && rank === 4) || (direction === -1 && rank === 3)) {
      adjacentFiles.forEach(f => {
        if (position?.[rank]?.[f] === aiPawn && position?.[rank + direction + direction]?.[f] === '' && previousPosition?.[rank]?.[f] === '' && previousPosition?.[rank + direction + direction]?.[f] === aiPawn) {
          moves.push([rank + direction, f]);
        }
      })

    }
  }


  return moves
}

export const getCastlingMoves = (position, castleDirection, piece, rank, file) => {
  const moves = [];
  
  if (file !== 4 || rank % 7 !== 0 || castleDirection === 'none') {
    return moves
  } 
  if (piece.startsWith('w')) {
    if (arbiter.isPlayerInCheck({positionAfterMove: position, player: 'w'}))
      return moves
    if (['left', 'both'].includes(castleDirection) && !position[0][3] && !position[0][2] && !position[0][1] && position[0][0] === 'wr' && !arbiter.isPlayerInCheck({positionAfterMove: arbiter.performMove(position, piece, rank, file, 0, 3), player: 'w'}) && !arbiter.isPlayerInCheck({positionAfterMove: arbiter.performMove(position, piece, rank, file, 0, 2), player: 'w'})) {
      moves.push([0,2])
    }
    if (['right', 'both'].includes(castleDirection) && !position[0][5] && !position[0][6] && position[0][7] === 'wr' && !arbiter.isPlayerInCheck({positionAfterMove: arbiter.performMove(position, piece, rank, file, 0, 6), player: 'w'}) && !arbiter.isPlayerInCheck({positionAfterMove: arbiter.performMove(position, piece, rank, file, 0, 5), player: 'w'})) {
      moves.push([0,6])
    }
  }
  if (piece.startsWith('b')) {
    if (arbiter.isPlayerInCheck({positionAfterMove: position, player: 'b'}))
      return moves
    if (['left', 'both'].includes(castleDirection) && !position[7][3] && !position[7][2] && !position[7][1] && position[7][0] === 'br' && !arbiter.isPlayerInCheck({positionAfterMove: arbiter.performMove(position, piece, rank, file, 7, 3), player: 'b'}) && !arbiter.isPlayerInCheck({positionAfterMove: arbiter.performMove(position, piece, rank, file, 7, 2), player: 'b'})) {
      moves.push([7,2])
    }
    if (['right', 'both'].includes(castleDirection) && !position[7][5] && !position[7][6] && position[7][7] === 'br' && !arbiter.isPlayerInCheck({positionAfterMove: arbiter.performMove(position, piece, rank, file, 7, 6), player: 'b'}) && !arbiter.isPlayerInCheck({positionAfterMove: arbiter.performMove(position, piece, rank, file, 7, 5), player: 'b'})) {
      moves.push([7,6])
    }
  }
  return moves
}

export const getCastlingDirections = (castleDirection, piece, rank, file) => {
  const direction = castleDirection[piece[0]];
  if (piece.endsWith('k')){
    return 'none'
  }
    
  if (file === 0 && rank === 0) {
    if (direction === 'both') {
      return 'right'
    }
    if (direction === 'left') {
      return 'none'
    }
  }

  if (file === 7 && rank === 0) {
    if (direction === 'both') {
      return 'left'
    }
    if (direction === 'right') {
      return 'none'
    }
  }

  if (file === 0 && rank === 7) {
    if (direction === 'both') {
      return 'right'
    }
    if (direction === 'left') {
      return 'none'
    }
  }

  if (file === 7 && rank === 7) {
    if (direction === 'both') {
      return 'left'
    }
    if (direction === 'right') {
      return 'none'
    }
  }
}

export const getKingPosition = (position, player) => {
  let kingPos
  position.forEach((rank, x) => {
    rank.forEach((file, y) => {
      if (position[x][y].startsWith(player) && position[x][y].endsWith('k'))
        kingPos = [x,y]
    })
  })
  return kingPos
}

export const getPieces = (position, ai) => {
  let aiPieces = []
  position.forEach((rank, x) => {
    rank.forEach((file, y) => {
      if (position[x][y].startsWith(ai))
        aiPieces.push({
          file: y,
          rank: x,
          piece: position[x][y]
        })
    })
  })
  return aiPieces
}