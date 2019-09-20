const incrementCountType = 'INCREMENT_KM';
const decrementCountType = 'DECREMENT_KM';
const addRouteType = 'ROUTE_ADD';
const removeRouteType = 'ROUTE_REMOVE';

const initialState = {
  count: 0,
  routes: [
    {
      description: 'Jakaś tam moja droga',
      key: 509876
    }
  ]
};

export const actionCreators = {
  increment: () => ({ type: incrementCountType }),
  decrement: () => ({ type: decrementCountType }),
  addRoute: route => ({
    type: addRouteType,
    route: route,
    key: route.key
  }),
  removeRoute: route => ({
    type: removeRouteType,
    key: route.key
  })
};

export const reducer = (state, action) => {
  state = state || initialState;
  switch (action.type) {
    case incrementCountType:
      return { ...state, count: state.count + 1 };
    case decrementCountType:
      return { ...state, count: state.count - 1 };
    case addRouteType:
      return {
        ...state,
        routes: [
          ...state.routes,
          {
            description: action.route.description,
            key: action.key
          }
        ]
      };
    case removeRouteType:
      return {
        ...state,
        routes: state.routes.filter(function(item) {
          return item.key !== action.key;
        })
      };
    default:
      return state;
  }
};
