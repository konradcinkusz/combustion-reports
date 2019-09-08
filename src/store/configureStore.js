import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import { firebaseReducer } from 'react-redux-firebase'
import firebase from 'firebase'

import * as WeatherForecasts from './WeatherForecasts';
import * as Fuel from './Fuel';
import * as Car from './Car';
import * as CombustionReport from './CombustionReport'

export default function configureStore(history, initialState) {

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDK_ZRw_K-sdQ814HkLpZ2ppX-kiQuwAHc",
        authDomain: "combustionreports.firebaseapp.com",
        databaseURL: "https://combustionreports.firebaseio.com",
        projectId: "combustionreports",
        storageBucket: "combustionreports.appspot.com",
        messagingSenderId: "889577197563",
        appId: "1:889577197563:web:e78a3cd0847a3fc7"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    const reducers = {
        weatherForecasts: WeatherForecasts.reducer,
        fuelItems: Fuel.reducer,
        cars: Car.reducer,
        combustionReports: CombustionReport.reducer
    };

    const middleware = [
        thunk,
        routerMiddleware(history)
    ];

    // In development, use the browser's Redux dev tools extension if installed
    const enhancers = [];
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment && typeof window !== 'undefined' && window.devToolsExtension) {
        enhancers.push(window.devToolsExtension());
    }

    const rootReducer = combineReducers({
        ...reducers,
        firebase: firebaseReducer,
        routing: routerReducer
    });

    return createStore(
        rootReducer,
        initialState,
        compose(applyMiddleware(...middleware), ...enhancers)
    );
}