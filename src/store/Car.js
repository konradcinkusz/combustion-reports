const addCarType = 'CAR_ADD';
const removeCarType = 'CAR_REMOVE';

export const actionCreators = {
    addCar: (car) => ({
        type: addCarType,
        carType: car.carType,
        carFuelKey: car.carFuelKey,
        carAverageCatalogueCityCombusiton: car.carAverageCatalogueCityCombusiton,
        carAverageCatalogueRouteCombusiton: car.carAverageCatalogueRouteCombusiton,
        carCoefficient: car.carCoefficient,
        key: car.key
    }),
    removeCar: (car) => ({
        type: removeCarType,
        car: car
    })
};

export const reducer = (state, action) => {
    state = state || [{
        carType: "Mazda",
        carFuelKey: 1111,
        carAverageCatalogueCityCombusiton: 5.4,
        carAverageCatalogueRouteCombusiton: 7.7,
        carCoefficient: 'undefined',
        key: 2222
    }, {
        carType: "Toyota",
        carFuelKey: 1111,
        carAverageCatalogueCityCombusiton: 8.4,
        carAverageCatalogueRouteCombusiton: 9.7,
        carCoefficient: 'undefined',
        key: 9999
    }]
    switch (action.type) {
        case addCarType:
            return [
                ...state, {
                    carType: action.carType,
                    carFuelKey: action.carFuelKey,
                    carAverageCatalogueCityCombusiton: action.carAverageCatalogueCityCombusiton,
                    carAverageCatalogueRouteCombusiton: action.carAverageCatalogueRouteCombusiton,
                    key: action.key
                }
            ]
        case removeCarType:
            return state.filter(function (item) {
                return (item.key !== action.car.key);
            })
        default:
            return state
    }
};