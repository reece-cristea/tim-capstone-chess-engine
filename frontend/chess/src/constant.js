import { createPositions } from "./helper";

export const Status = {
    'ongoing' : 'Ongoing',
    'promoting' : 'Promoting',
    'white' : 'White wins!',
    'black' : 'Black wins!',
    'stalemate' : 'stalemate'
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
    }
}