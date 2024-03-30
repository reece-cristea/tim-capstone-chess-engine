import { initGame } from "../../constant"
import actionTypes from "../actionTypes"

export const setupNewGame = () => {
    return {
        type: actionTypes.NEW_GAME,
        payload: initGame
    }
}