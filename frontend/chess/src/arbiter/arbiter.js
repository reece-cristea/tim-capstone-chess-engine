import { getKnightMoves, getRookMoves, getBishopMoves, getQueenMoves, getKingMoves, getPawnMoves, getCastlingMoves, getKingPosition, getPieces, getPawnCaptures } from "./getMoves"
import { movePawn, movePiece } from "./move"

const arbiter = {
    getRegularMoves : function(position, piece, rank, file) {
        let moves = []
        
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
            ]
        }
        if (piece.endsWith('p')) {
            moves = getPawnMoves(position, piece, rank, file)
        }
        
        return moves
    },

    getValidMoves: function (position, castleDirection, previousPosition, piece, rank, file) {
        let moves = this.getRegularMoves(position, piece, rank, file)
        if (piece.endsWith('p')) {
            moves = [
                ...moves,
                ...getPawnCaptures(position, previousPosition, piece, rank, file)
            ]
        }
        if (piece.endsWith('k')) {
            moves = [
                ...moves,
                ...getCastlingMoves(position, castleDirection, piece, rank, file)
            ]

        }
        let notInCheckMoves = []
        moves.forEach(([x,y]) => {
            const positionAfterMove = this.performMove(position, piece, rank, 7 - file, x, y)
            if (!this.isPlayerInCheck({positionAfterMove: positionAfterMove, position: position, player: piece[0]})) {
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
    isPlayerInCheck: function ({positionAfterMove, position, player}){
        const ai = player.startsWith('w') ? 'b' : 'w';
        let kingPosition = getKingPosition(positionAfterMove, player);
        const aiPieces = getPieces(positionAfterMove, ai);
        const aiMoves = aiPieces.reduce((acc, p) => acc = [
            ...acc,
            ...(p.piece.endsWith('p'))
            ? getPawnCaptures(positionAfterMove, position, p.piece, p.rank, p.file)
            : this.getRegularMoves(positionAfterMove, p.piece, p.rank, p.file)
        ], [])
        if (aiMoves.some(([x,y]) => kingPosition[0] === x && kingPosition[1] === y))
            return true

        return false
    }

}

export default arbiter