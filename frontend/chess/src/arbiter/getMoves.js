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
    console.log(rank)
    console.log(file)
    console.log(sq[0])
    console.log(sq[1])
    const square = position?.[rank + sq[0]]?.[file + sq[1]];
    if (square !== undefined && (square.startsWith(ai) || square === '')) {
      moves.push([rank + sq[0], file + sq[1]]);
    }
  })

  return moves
}