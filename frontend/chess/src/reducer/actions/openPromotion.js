import actionTypes from "../actionTypes"

export const openPromotion = (rank, file, x, y) => {
    return {
        type: actionTypes.OPEN_PROMOTION,
        payload: {rank, file, x ,y}
    }
}