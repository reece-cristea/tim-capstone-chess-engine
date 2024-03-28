import { getKnightMoves, getRookMoves, getBishopMoves, getQueenMoves, getKingMoves, getPawnMoves, getCastlingMoves } from "./getMoves"
import { movePawn, movePiece } from "./move"

const arbiter = {
    getRegularMoves : function(position, previousPosition, castleDirection, piece, rank, file) {
        let moves = []
        const notInCheckMoves = []
        if (piece.endsWith('r')) {
            moves = getRookMoves(position, piece, rank, file)
        }
        if (piece.endsWith('n')) {
            moves = getKnightMoves(position, rank, file)
        }
        if (piece.endsWith('b')) {
            moves = getBishopMoves(position, piece, rank, file)
        }
        if (piece.endsWith('q')) {
            moves = getQueenMoves(position, piece, rank, file)
        }
        if (piece.endsWith('k')) {
            moves = [
                ...getKingMoves(position, piece, rank, file),
                ...getCastlingMoves(position, castleDirection, piece, rank, file)
            ]
        }
        if (piece.endsWith('p')) {
            moves = getPawnMoves(position, previousPosition, piece, rank, file)
        }

        moves.forEach(([x,y]) => {
            const positionAfterMove = this.performMove(position, piece, rank, file, x, y)
            if (!this.isPlayerInCheck(positionAfterMove, position, piece[0], castleDirection)) {
                notInCheckMoves.push([x,y])
            }
        })

        return notInCheckMoves
    },
    performMove: function (position, piece, rank, file, x ,y) {
        if(piece.endsWith('p')) {
            return movePawn(position, piece, rank, file, x ,y)
        } else {
            return movePiece(position, piece, rank, file, x ,y)
        }
    },
    isPlayerInCheck: function (positionAfterMove, position, player, castleDirection){
        const ai = player.startsWith('w') ? 'b' : 'w';
        let kingPosition = getKingPosition(positionAfterMove, player);
        const aiPieces = getPieces(positionAfterMove, ai);
        const aiMoves = aiPieces.reduce((acc,p) => acc = [
            ...acc,
            ...(p.piece.endsWith('p'))
            ? getPawnMoves(positionAfterMove, position, ...p)
            : this.getRegularMoves(positionAfterMove, position, castleDirection, ...p )

        ], [])
        if (aiMoves.some(([x,y]) => kingPosition[0] === x && kingPosition[1] === y))
            return true
        return false
    }

}

export default arbiter