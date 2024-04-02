import { areSameColorTiles, findPieceCoords } from "../helper"
import { getKnightMoves, getRookMoves, getBishopMoves, getQueenMoves, getKingMoves, getPawnMoves, getCastlingMoves, getKingPosition, getPieces, getPawnCaptures } from "./getMoves"
import { movePawn, movePiece } from "./move"

const arbiter = {
    getRegularMoves: function (position, piece, rank, file) {
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

    getValidMoves: function ({ position, castleDirection, previousPosition, piece, rank, file }) {
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
        moves.forEach(([x, y]) => {
            const positionAfterMove = this.performMove(position, piece, rank, 7 - file, x, y)
            if (!this.isPlayerInCheck({ positionAfterMove: positionAfterMove, position: position, player: piece[0] })) {
                notInCheckMoves.push([x, y])
            }
        })
        return notInCheckMoves
    },
    performMove: function (position, piece, rank, file, x, y) {
        if (piece.endsWith('p')) {
            return movePawn(position, piece, rank, file, x, y)
        } else {
            return movePiece(position, piece, rank, file, x, y)
        }
    },
    isPlayerInCheck: function ({ positionAfterMove, position, player }) {
        const ai = player.startsWith('w') ? 'b' : 'w';
        let kingPosition = getKingPosition(positionAfterMove, player);
        const aiPieces = getPieces(positionAfterMove, ai);
        const aiMoves = aiPieces.reduce((acc, p) => acc = [
            ...acc,
            ...(p.piece.endsWith('p'))
                ? getPawnCaptures(positionAfterMove, position, p.piece, p.rank, p.file)
                : this.getRegularMoves(positionAfterMove, p.piece, p.rank, p.file)
        ], [])
        if (aiMoves.some(([x, y]) => kingPosition[0] === x && kingPosition[1] === y))
            return true

        return false
    },
    isStalemate: function (newPostion, currentPlayer, castleDirection) {
        const isInCheck = this.isPlayerInCheck({ positionAfterMove: newPostion, player: currentPlayer });
        if (isInCheck) {
            return false
        }
        const pieces = getPieces(newPostion, currentPlayer);
        const moves = pieces.reduce((acc, p) => acc = [
            ...acc,
            ...(this.getValidMoves(
                {
                    position: newPostion,
                    castleDirection,
                    ...p
                }
            ))
        ], [])
        return (!isInCheck && moves.length === 0);
    },
    insufficientMaterials: function (position) {
        const pieces = position.reduce((acc, rank) =>
            acc = [
                ...acc,
                ...rank.filter(x => x)
            ], [])
        if (pieces.length === 2) {
            return true
        }

        if (pieces.length === 3 && pieces.some(p => p.endsWith('b') || p.endsWith('n'))) {
            return true
        }

        if (pieces.length === 4 && pieces.every(p => p.endsWith('b') || p.endsWith('k')) && new Set(pieces).size === 4  && areSameColorTiles(findPieceCoords(position, 'wb')[0], findPieceCoords(position, 'bb')[0])) {
            return true
        }
        return false
    },
    isCheckmate: function (newPostion, currentPlayer, castleDirection) {
        const isInCheck = this.isPlayerInCheck({ positionAfterMove: newPostion, player: currentPlayer });
        if (!isInCheck) {
            return false
        }
        const pieces = getPieces(newPostion, currentPlayer);
        const moves = pieces.reduce((acc, p) => acc = [
            ...acc,
            ...(this.getValidMoves(
                {
                    position: newPostion,
                    castleDirection,
                    ...p
                }
            ))
        ], [])
        return (isInCheck && moves.length === 0);
    },
    threefoldRepetition: function (positions, turn) {
        const positionCounter = {}
        positions.forEach(pos => {
            if (positionCounter[pos]) {
                positionCounter[pos] += 1
            } else {
                positionCounter[pos] = 1;
            }
        })
        console.log(positionCounter)
        for (const pos in positionCounter) {
            if (positionCounter[pos] >= 3) {
                return true
            }
        }
        
        return false
    }
}

export default arbiter