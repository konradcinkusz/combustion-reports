import { createSlice, nanoid } from '@reduxjs/toolkit';
import { fuelRemoved } from './fuelsSlice.js';

export const defaultCars = [
  {
    id: 'seed-car-mazda',
    name: 'Mazda 6',
    fuelId: 'seed-fuel-pb95',
    catalogueCityCombustion: 8.4,
    catalogueRouteCombustion: 5.4,
  },
  {
    id: 'seed-car-toyota',
    name: 'Toyota Avensis',
    fuelId: 'seed-fuel-diesel',
    catalogueCityCombustion: 6.8,
    catalogueRouteCombustion: 4.9,
  },
];

const carsSlice = createSlice({
  name: 'cars',
  initialState: defaultCars,
  reducers: {
    carAdded: {
      reducer: (state, action) => {
        state.push(action.payload);
      },
      prepare: ({ name, fuelId, catalogueCityCombustion, catalogueRouteCombustion }) => ({
        payload: {
          id: nanoid(),
          name: name.trim(),
          fuelId: fuelId || null,
          catalogueCityCombustion: Number(catalogueCityCombustion),
          catalogueRouteCombustion: Number(catalogueRouteCombustion),
        },
      }),
    },
    carRemoved: (state, action) => state.filter((c) => c.id !== action.payload),
  },
  extraReducers: (builder) => {
    // Deleting a fuel must not leave cars pointing at an id that no longer
    // exists: the cost column would read as a permanent "—" with no way for the
    // user to tell why. Null it out so the car visibly needs a fuel reassigned.
    builder.addCase(fuelRemoved, (state, action) => {
      state.forEach((car) => {
        if (car.fuelId === action.payload) car.fuelId = null;
      });
    });
  },
});

export const { carAdded, carRemoved } = carsSlice.actions;
export default carsSlice.reducer;

export function isDuplicateCarName(cars, name, ignoreId = null) {
  const needle = (name ?? '').trim().toLowerCase();
  if (!needle) return false;
  return cars.some((c) => c.id !== ignoreId && c.name.toLowerCase() === needle);
}
