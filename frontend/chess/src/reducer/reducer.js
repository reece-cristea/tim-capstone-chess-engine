import { Status } from "../constant";
import actionTypes from "./actionTypes"

export const reducer = (state, action) => {
    switch (action.type) {
        case actionTypes.NEW_MOVE: {
            let { turn, position } = state
            turn = turn === 'w' ? 'b' : 'w';
            position = [...position, action.payload.newPosition]
            return {
                ...state,
                turn,
                position
            }
        }
        case actionTypes.SHOW_LEGAL_MOVES: {
            return {
                ...state,
                legalMoves: action.payload
            }
        }
        case actionTypes.CLEAR_LEGAL_MOVES: {
            return {
                ...state,
                legalMoves: []
            }
        }
        case actionTypes.OPEN_PROMOTION: {
            return {
                ...state,
                status: Status.promoting,
                promotionSquare: { ...action.payload }
            }
        }
        case actionTypes.CLOSE_PROMOTION: {
            return {
                ...state,
                status: Status.ongoing,
                promotionSquare: null
            }
        }
        case actionTypes.CAN_CASTLE: {
            let { turn, castleDirection } = state
            castleDirection[turn] = action.payload
            return {
                ...state,
                castleDirection
            }
        }
        case actionTypes.STALEMATE: {
            return {
                ...state,
                status: Status.stalemate
            }
        }
        case actionTypes.NEW_GAME: {
            return {
                ...action.payload
            }
        }
        case actionTypes.INSUFFICIENT_MATERIALS: {
            return {
                ...state,
                status: Status.insufficientMaterials
            }
        }
        case actionTypes.CHECKMATE: {
            return {
                ...state,
                status: action.payload === 'w' ? Status.white : Status.black
            }
        }
        case actionTypes.THREEFOLD: {
            return {
                ...state,
                status: Status.threefold
            }
        }
        default:
            return state;
    }
}