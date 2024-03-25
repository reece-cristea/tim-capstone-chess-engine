import React from 'react'
import './popup.css'
import Promotion from './Promotion/promotion'
import { useAppContext } from '../../contexts/context'
import { Status } from '../../constant'
import { closePopUp } from '../../reducer/actions/closePromotion'

const PopUp = () => {
    const { appState, dispatch } = useAppContext()

    function onClosePopUp() {
        dispatch(closePopUp());
    }

    if (appState.status === Status.ongoing)
        return null

    return (
        <div className='popup'>
            <Promotion onClosePopUp={onClosePopUp}/>
        </div>
    )
}

export default PopUp