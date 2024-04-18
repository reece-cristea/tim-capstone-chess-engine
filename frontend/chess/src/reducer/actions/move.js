import actionTypes from "../actionTypes"

export const makeMove = ({newPosition}) => {
    return {
        type: actionTypes.NEW_MOVE,
        payload : {newPosition}
    }
}