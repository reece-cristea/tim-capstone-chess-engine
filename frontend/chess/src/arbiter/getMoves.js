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
          break
        }
        if(position[x][y].startsWith(player)) {
          break
        }
        moves.push([x,y])
      }
    })
    return moves;
  }
