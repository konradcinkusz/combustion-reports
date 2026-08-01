import { configureStore } from '@reduxjs/toolkit';
import fuelsReducer from './fuelsSlice.js';
import carsReducer from './carsSlice.js';
import reportsReducer from './reportsSlice.js';
import { loadState, persistenceMiddleware } from './persistence.js';

/**
 * `preloadedState` defaults to whatever was persisted; tests pass their own (or
 * `undefined`) to start from the seed data.
 */
export function createAppStore(preloadedState = loadState()) {
  return configureStore({
    reducer: {
      fuels: fuelsReducer,
      cars: carsReducer,
      reports: reportsReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistenceMiddleware()),
  });
}

export const store = createAppStore();
