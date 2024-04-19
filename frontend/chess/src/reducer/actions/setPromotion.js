import actionTypes from "../actionTypes"

export const setPromotingPiece = (option) => {
    return {
        type: actionTypes.SETTING_PROMOTION_PIECE,
        payload: option
    }
}