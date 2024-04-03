
import { useReducer } from 'react';
import './App.css';
import { Board } from './components';
import AppContext from './contexts/context';
import { reducer } from './reducer/reducer';
import { initGame } from './constant';
import CapturedPieces from './components/CapturedPieces/capturedPieces';

function App() {

  const [appState, dispatch] = useReducer(reducer, initGame);

  const providerState = {
    appState,
    dispatch
  }

  return (
    <AppContext.Provider value={providerState} >
      <div className="App">
        <CapturedPieces color={'w'}/>
        <Board />
        <CapturedPieces color={'b'}/>
      </div>
    </AppContext.Provider>
  );
}

export default App;
