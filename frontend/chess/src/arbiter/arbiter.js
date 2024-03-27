import { getKnightMoves, getRookMoves, getBishopMoves, getQueenMoves, getKingMoves, getPawnMoves, getCastlingMoves } from "./getMoves"
import { movePawn, movePiece } from "./move"

const arbiter = {
    getRegularMoves : function(position, previousPosition, castleDirection, piece, rank, file) {
        if (piece.endsWith('r')) {
            return getRookMoves(position, piece, rank, file)
        }
        if (piece.endsWith('n')) {
            return getKnightMoves(position, rank, file)
        }
        if (piece.endsWith('b')) {
            return getBishopMoves(position, piece, rank, file)
        }
        if (piece.endsWith('q')) {
            return getQueenMoves(position, piece, rank, file)
        }
        if (piece.endsWith('k')) {
            let moves = [
                ...getKingMoves(position, piece, rank, file),
                ...getCastlingMoves(position, castleDirection, piece, rank, file)
            ]
            return moves
        }
        if (piece.endsWith('p')) {
            return getPawnMoves(position, previousPosition, piece, rank, file)
        }
    },
    performMove: function (position, piece, rank, file, x ,y) {
        if(piece.endsWith('p')) {
            return movePawn(position, piece, rank, file, x ,y)
        } else {
            return movePiece(position, piece, rank, file, x ,y)
        }
    }

}

export default arbiter