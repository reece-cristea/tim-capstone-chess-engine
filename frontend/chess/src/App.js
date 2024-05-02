
import { useReducer } from 'react';
import './App.css';
import { Board } from './components';
import AppContext from './contexts/context';
import { reducer } from './reducer/reducer';
import { initGame } from './constant';
import CapturedPieces from './components/CapturedPieces/capturedPieces';
import { setupNewGame } from './reducer/actions/newGame';

function App() {

  const [appState, dispatch] = useReducer(reducer, initGame);

  const providerState = {
    appState,
    dispatch
  }

  const newGame = async () => {
    dispatch(setupNewGame());
    await fetch(`http://127.0.0.1:5000/reset`)
  }

  return (
    <AppContext.Provider value={providerState} >
      <div className='content'>
        <div className="App">
          <CapturedPieces color={'w'} />
          <Board />
          <CapturedPieces color={'b'} />
        </div>
        <button className="reset-button" onClick={(e) => newGame()}>Reset</button>
      </div>

    </AppContext.Provider>
  );
}

export default App;
