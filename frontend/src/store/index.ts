import {createStore, applyMiddleware, combineReducers} from "redux";
import upload from "./upload";
import createSagaMiddleware from 'redux-saga';
import rootSaga from "./root-saga";

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
    combineReducers({
        upload
    }),
    applyMiddleware(sagaMiddleware),
);

sagaMiddleware.run(rootSaga);

export default store;
