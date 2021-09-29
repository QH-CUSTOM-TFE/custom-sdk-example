import './global.scss';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import Main from './main';

function App() {
    return (
        <Provider store={store}>
            <Main />
        </Provider>
    );
}

export default App;
