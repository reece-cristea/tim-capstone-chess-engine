import actionTypes from "../actionTypes"

export const checkmate = turn => {
    return {
        type: actionTypes.CHECKMATE,
        payload: turn
    }
}