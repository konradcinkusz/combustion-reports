const addCarType = 'CAR_ADD';
const removeCarType = 'CAR_REMOVE';
const updateCarPoly = 'CAR_UPDATE_POLYNOMIAL';

export const actionCreators = {
  addCar: car => ({
    type: addCarType,
    carType: car.carType,
    carFuelKey: car.carFuelKey,
    carAverageCatalogueCityCombusiton: car.carAverageCatalogueCityCombusiton,
    carAverageCatalogueRouteCombusiton: car.carAverageCatalogueRouteCombusiton,
    combustionVelocityPoly: car.combustionVelocityPoly,
    combustionRoutePoly: car.combustionRoutePoly,
    key: car.key
  }),
  removeCar: car => ({
    type: removeCarType,
    car: car
  }),
  updateCarPoly: car => ({
    type: updateCarPoly,
    car: car,
    combustionVelocityPoly: car.combustionVelocityPoly,
    combustionRoutePoly: car.combustionRoutePoly
  })
};

export const reducer = (state, action) => {
  state = state || [
    {
      carType: 'Mazda',
      carFuelKey: 1111,
      carAverageCatalogueCityCombusiton: 5.4,
      carAverageCatalogueRouteCombusiton: 7.7,
      combustionVelocityPoly: 'undefined',
      combustionRoutePoly: 'undefined',
      key: 2222
    },
    {
      carType: 'Toyota',
      carFuelKey: 1111,
      carAverageCatalogueCityCombusiton: 8.4,
      carAverageCatalogueRouteCombusiton: 9.7,
      combustionVelocityPoly: 'undefined',
      combustionRoutePoly: 'undefined',
      key: 9999
    }
  ];
  switch (action.type) {
    case addCarType:
      return [
        ...state,
        {
          carType: action.carType,
          carFuelKey: action.carFuelKey,
          carAverageCatalogueCityCombusiton:
            action.carAverageCatalogueCityCombusiton,
          carAverageCatalogueRouteCombusiton:
            action.carAverageCatalogueRouteCombusiton,
          key: action.key
        }
      ];
    case removeCarType:
      return state.filter(function(item) {
        return item.key !== action.car.key;
      });
    case updateCarPoly:
      return state.map(item => {
        if (item.key !== action.car.key) {
          // This isn't the item we care about - keep it as-is
          return item;
        }

        // Otherwise, this is the one we want - return an updated value
        return {
          ...item,
          ...{
            ...item,
            combustionVelocityPoly: action.car.combustionVelocityPoly,
            combustionRoutePoly: action.car.combustionRoutePoly
          }
        };
      });
    default:
      return state;
  }
};
