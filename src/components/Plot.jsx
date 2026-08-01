import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist-min';

/**
 * The single place plotly is bound to React.
 *
 * `react-plotly.js`'s default export imports the full `plotly.js` build — every
 * trace type, mapbox, and the whole 3D/WebGL stack, ~4.9 MB minified. This app
 * draws scatter and line traces only, so it binds the *basic* bundle through the
 * factory instead, which is roughly a fifth of the size.
 *
 * Isolating it here also gives the test suite one module to stub, rather than
 * mocking a third-party import path from every test that renders a chart.
 */
const Plot = createPlotlyComponent(Plotly);

export default Plot;
