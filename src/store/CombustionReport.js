const addReportType = 'REPORT_ADD';
const removeReportType = 'REPORT_REMOVE';

export const actionCreators = {
  addReport: report => ({
    type: addReportType,
    routeKilometers: report.routeKilometers,
    averageCombusiton: report.averageCombusiton,
    averageSpeed: report.averageSpeed,
    carKey: report.carKey,
    key: report.key
  }),
  removeReport: report => ({
    type: removeReportType,
    report: report
  })
};

export const reducer = (state, action) => {
  state = state || [
    {
      routeKilometers: 300,
      averageCombusiton: 7,
      averageSpeed: 110,
      carKey: 2222,
      key: 3333
    },
    {
      routeKilometers: 15,
      averageCombusiton: 6.5,
      averageSpeed: 70,
      carKey: 2222,
      key: 4444
    },
    {
      routeKilometers: 650,
      averageCombusiton: 4.5,
      averageSpeed: 77,
      carKey: 2222,
      key: 5555
    },
    {
      routeKilometers: 1050,
      averageCombusiton: 5,
      averageSpeed: 70,
      carKey: 9999,
      key: 6666
    },
    {
      routeKilometers: 2050,
      averageCombusiton: 7.7,
      averageSpeed: 90,
      carKey: 9999,
      key: 7777
    }
  ];

  switch (action.type) {
    case addReportType:
      return [
        ...state,
        {
          routeKilometers: action.routeKilometers,
          averageCombusiton: action.averageCombusiton,
          averageSpeed: action.averageSpeed,
          carKey: action.carKey,
          key: action.key
        }
      ];
    case removeReportType:
      return state.filter(function(item) {
        return item.key !== action.report.key;
      });
    default:
      return state;
  }
};
