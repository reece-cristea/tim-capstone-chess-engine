import actionTypes from "../actionTypes"

export const makeMove = ({newPosition}) => {
    console.log(newPosition)
    return {
        type: actionTypes.NEW_MOVE,
        payload : {newPosition}
    }
}