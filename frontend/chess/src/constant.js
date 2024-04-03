import { createPositions } from "./helper";

export const Status = {
    'ongoing' : 'Ongoing',
    'promoting' : 'Promoting',
    'white' : 'White wins!',
    'black' : 'Black wins!',
    'stalemate' : 'The game ended in a stalemate.',
    'insufficientMaterials' : 'The game ended in a draw because there is insufficient material.',
    'threefold' : 'The game ended in a draw due to threefold repetition.'
}

export const initGame = {
    position : [createPositions()],
    turn : 'w',
    legalMoves : [],
    status : Status.ongoing,
    promotionSquare : null,
    castleDirection : {
        w: 'both',
        b: 'both'
    },
    capturedPieces: []
}