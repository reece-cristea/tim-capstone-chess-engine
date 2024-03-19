import actionTypes from "../actionTypes";

export const showLegalMoves = (legalMoves) => {
    return {
        type: actionTypes.SHOW_LEGAL_MOVES,
        payload: legalMoves
    }
}