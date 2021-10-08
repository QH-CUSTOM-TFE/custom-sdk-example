import { createStore } from 'redux';
import { reducers } from './reducers';

const w: any = window;

export const store = createStore(
    reducers,
    w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__()
);
