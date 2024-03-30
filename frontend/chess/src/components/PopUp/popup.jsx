import React from 'react'
import './popup.css'
import { useAppContext } from '../../contexts/context'
import { Status } from '../../constant'
import { closePopUp } from '../../reducer/actions/closePromotion'

const PopUp = ({children}) => {
    const { appState, dispatch } = useAppContext()

    function onClosePopUp() {
        dispatch(closePopUp());
    }

    if (appState.status === Status.ongoing)
        return null

    return (
        <div className='popup'>
            {React.Children.toArray(children).map(child => React.cloneElement(child, {onClosePopUp}))}
        </div>
    )
}

export default PopUp