import { createSlice, nanoid } from '@reduxjs/toolkit';

/**
 * Seed data so a first-time visitor sees a working app rather than three empty
 * forms. It is replaced entirely once a persisted snapshot exists.
 */
export const defaultFuels = [
  { id: 'seed-fuel-pb95', name: 'Pb95', pricePerLitre: 6.29 },
  { id: 'seed-fuel-diesel', name: 'Diesel', pricePerLitre: 6.45 },
];

const fuelsSlice = createSlice({
  name: 'fuels',
  initialState: defaultFuels,
  reducers: {
    fuelAdded: {
      reducer: (state, action) => {
        state.push(action.payload);
      },
      prepare: ({ name, pricePerLitre }) => ({
        payload: { id: nanoid(), name: name.trim(), pricePerLitre: Number(pricePerLitre) },
      }),
    },
    fuelRemoved: (state, action) => state.filter((f) => f.id !== action.payload),
    fuelUpdated: (state, action) => {
      const fuel = state.find((f) => f.id === action.payload.id);
      if (!fuel) return;
      // Explicit field assignment rather than Object.assign so an unexpected key
      // in the payload cannot quietly widen the stored shape.
      if (typeof action.payload.name === 'string') fuel.name = action.payload.name.trim();
      if (Number.isFinite(action.payload.pricePerLitre)) fuel.pricePerLitre = action.payload.pricePerLitre;
    },
  },
});

export const { fuelAdded, fuelRemoved, fuelUpdated } = fuelsSlice.actions;
export default fuelsSlice.reducer;

/** Case-insensitive duplicate check, optionally ignoring one id (for edits). */
export function isDuplicateFuelName(fuels, name, ignoreId = null) {
  const needle = (name ?? '').trim().toLowerCase();
  if (!needle) return false;
  return fuels.some((f) => f.id !== ignoreId && f.name.toLowerCase() === needle);
}
