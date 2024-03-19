
import { useReducer } from 'react';
import './App.css';
import { Board } from './components';
import AppContext from './contexts/context';
import { reducer } from './reducer/reducer';
import { initGame } from './constant';

function App() {

  const [appState, dispatch] = useReducer(reducer, initGame);

  const providerState = {
    appState,
    dispatch
  }

  return (
    <AppContext.Provider value={providerState} >
      <div className="App">
        <Board />
      </div>
    </AppContext.Provider>
  );
}

export default App;
