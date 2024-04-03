import actionTypes from "../actionTypes"

export const capturedPiece = (piece) => {
    return {
        type: actionTypes.CAPTURE,
        payload: piece
    }
}