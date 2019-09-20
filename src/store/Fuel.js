const addFuelType = 'FUEL_ADD';
const removeFuelType = 'FUEL_REMOVE';
const updateFuelType = 'FUEL_UPDATE';
const requestFuelType = 'REQUEST_FUEL';
const receiveFuelType = 'RECEIVE_FUEL';

const inititalState = {
  fuels: [
    {
      fuelType: 'Pb95',
      fuelPrice: 4.5,
      key: 1111
    }
  ],
  fuelItemsServer: '',
  isLoading: false
};

export const actionCreators = {
  addFuel: fuel => ({
    type: addFuelType,
    fuelType: fuel.fuelType,
    fuelPrice: fuel.fuelPrice,
    key: fuel.key
  }),
  removeFuel: fuel => ({
    type: removeFuelType,
    fuel: fuel
  }),
  updateFuel: fuel => ({
    type: updateFuelType,
    fuel: fuel
  }),
  requestFuelType: () => async dispatch => {
    //if (startDateIndex === getState().fuelItemsServer.startDateIndex) {
    //    // Don't issue a duplicate request (we already have or are loading the requested data)
    //    return;
    //}

    dispatch({ type: requestFuelType });

    const url = `api/FuelData/Get`;
    const response = await fetch(url);
    const fuelItemsServer = await response.json();

    dispatch({ type: receiveFuelType, fuelItemsServer });
  }
};

export const reducer = (state, action) => {
  state = state || inititalState;

  switch (action.type) {
    case addFuelType:
      return {
        ...state,
        fuels: [
          ...state.fuels,
          {
            fuelType: action.fuelType,
            fuelPrice: action.fuelPrice,
            key: action.key
          }
        ]
      };
    case removeFuelType:
      return {
        ...state,
        fuels: state.fuels.filter(function(item) {
          return item.key !== action.fuel.key;
        })
      };
    case updateFuelType:
      return {
        ...state,
        fuels: state.fuels.map(item => {
          if (item.key !== action.key) {
            // This isn't the item we care about - keep it as-is
            return item;
          }

          // Otherwise, this is the one we want - return an updated value
          return {
            ...action.fuel //TODO: Konrad - to chyba jest źle rozpakowywane
            //...item,
            //...{ ...item, combustion: action.updateInformation.combustion }
          };
        })
      };
    case requestFuelType:
      return {
        ...state,
        fuelItemsServer: action.fuelItemsServer,
        isLoading: true
      };
    case receiveFuelType:
      return {
        ...state,
        fuelItemsServer: action.fuelItemsServer,
        isLoading: false
      };
    default:
      return state;
  }
};
