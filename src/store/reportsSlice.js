import { createSlice, nanoid } from '@reduxjs/toolkit';
import { carRemoved } from './carsSlice.js';

export const defaultReports = [
  { id: 'seed-report-1', carId: 'seed-car-mazda', routeKilometers: 300, averageCombustion: 7.0, averageSpeed: 110 },
  { id: 'seed-report-2', carId: 'seed-car-mazda', routeKilometers: 15, averageCombustion: 9.8, averageSpeed: 32 },
  { id: 'seed-report-3', carId: 'seed-car-mazda', routeKilometers: 650, averageCombustion: 6.1, averageSpeed: 96 },
  { id: 'seed-report-4', carId: 'seed-car-mazda', routeKilometers: 120, averageCombustion: 7.9, averageSpeed: 74 },
  { id: 'seed-report-5', carId: 'seed-car-toyota', routeKilometers: 1050, averageCombustion: 5.0, averageSpeed: 70 },
  { id: 'seed-report-6', carId: 'seed-car-toyota', routeKilometers: 2050, averageCombustion: 5.7, averageSpeed: 90 },
  { id: 'seed-report-7', carId: 'seed-car-toyota', routeKilometers: 40, averageCombustion: 7.4, averageSpeed: 38 },
];

const reportsSlice = createSlice({
  name: 'reports',
  initialState: defaultReports,
  reducers: {
    reportAdded: {
      reducer: (state, action) => {
        state.push(action.payload);
      },
      prepare: ({ carId, routeKilometers, averageCombustion, averageSpeed }) => ({
        payload: {
          id: nanoid(),
          carId,
          routeKilometers: Number(routeKilometers),
          averageCombustion: Number(averageCombustion),
          averageSpeed: Number(averageSpeed),
        },
      }),
    },
    reportRemoved: (state, action) => state.filter((r) => r.id !== action.payload),
  },
  extraReducers: (builder) => {
    // Reports are meaningless without the car they were recorded against, and
    // orphans would still count towards the totals on the reports page.
    builder.addCase(carRemoved, (state, action) => state.filter((r) => r.carId !== action.payload));
  },
});

export const { reportAdded, reportRemoved } = reportsSlice.actions;
export default reportsSlice.reducer;
