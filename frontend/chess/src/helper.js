export  const getCharacter = file => String.fromCharCode(file + 96);

export const createPositions = () => {
    const postion = new Array(8).fill('').map(x => new Array(8).fill(''))
    postion[0][0] = 'wr'
    postion[0][1] = 'wn'
    postion[0][2] = 'wb'
    postion[0][3] = 'wq'
    postion[0][4] = 'wk'
    postion[0][5] = 'wb'
    postion[0][6] = 'wn'
    postion[0][7] = 'wr'
    postion[7][0] = 'br'
    postion[7][1] = 'bn'
    postion[7][2] = 'bb'
    postion[7][3] = 'bq'
    postion[7][4] = 'bk'
    postion[7][5] = 'bb'
    postion[7][6] = 'bn'
    postion[7][7] = 'br'
    postion[1][0] = 'wp'
    postion[1][1] = 'wp'
    postion[1][2] = 'wp'
    postion[1][3] = 'wp'
    postion[1][4] = 'wp'
    postion[1][5] = 'wp'
    postion[1][6] = 'wp'
    postion[1][7] = 'wp'
    postion[6][0] = 'bp'
    postion[6][1] = 'bp'
    postion[6][2] = 'bp'
    postion[6][3] = 'bp'
    postion[6][4] = 'bp'
    postion[6][5] = 'bp'
    postion[6][6] = 'bp'
    postion[6][7] = 'bp'
    return postion;
}

export const copyPosition = position => {
    const newPostion = new Array(8).fill('').map(x => new Array(8).fill(''));
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            newPostion[rank][file] = position[rank][file]
        }
    }

    return newPostion;
}

export const areSameColorTiles = (coords1, coords2) => {
    return (coords1.x + coords1.y % 2 === coords2.x + coords2.y % 2)
}

export const findPieceCoords = (position, piece) => {
    let results = []
    position.forEach ((rank, i) => {
        rank.forEach ((pos, j) => {
            if (pos === piece) {
                results.push({x:i, y:j})
            }
        })
    })
    return results
}

export const getAlgebraicNotation = (x, y) => {
    let files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    let rank = Number(x) + 1
    let file = files[y]
    return `${file}${rank}`
}

export const reverseAlgebraicNotation = (str) => {
    let squares = [str.substr(0,str.length / 2), str.substr(str.length / 2,str.length)]
    let files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    let from = { rank: Number(squares[0][1]) - 1, file: files.indexOf(squares[0][0])}
    let to = { rank: Number(squares[1][1]) - 1, file: files.indexOf(squares[1][0])}
    return {from: from, to: to}
}