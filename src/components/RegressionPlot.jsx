import { useMemo } from 'react';
import Plot from './Plot.jsx';
import { sampleCurve } from '../core/index.js';
import { useI18n } from '../i18n/index.jsx';

/**
 * Scatter of the recorded samples with the fitted polynomial over the top.
 *
 * Replaces the pre-1.0 `Polynomial` component, which read
 * `props.regression.string` unconditionally and so threw
 * `Cannot read properties of undefined` on any page that had no model to give
 * it — the /route page rendered as a blank screen for exactly this reason.
 * `model` here is always a well-formed object from `core/regression`, and the
 * not-enough-data case is a first-class branch rather than a crash.
 */
export default function RegressionPlot({ model, title, xAxisLabel }) {
  const { t } = useI18n();

  const curve = useMemo(() => sampleCurve(model), [model]);

  if (!model?.ok) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h3 className="card-title h6">{title}</h3>
          <p className="text-body-secondary mb-0 small">{t('plot.noModel')}</p>
        </div>
      </section>
    );
  }

  const traces = [
    {
      x: model.points.map(([x]) => x),
      y: model.points.map(([, y]) => y),
      mode: 'markers',
      type: 'scatter',
      name: t('plot.samples'),
      marker: { size: 9 },
    },
    {
      x: curve.x,
      y: curve.y,
      mode: 'lines',
      type: 'scatter',
      name: t('plot.fitted'),
      line: { width: 2 },
    },
  ];

  const layout = {
    autosize: true,
    height: 280,
    // Room at the top for the legend, room at the bottom for the axis title —
    // with the legend underneath, the two collide at this height.
    margin: { l: 52, r: 16, b: 52, t: 28 },
    legend: { orientation: 'h', y: 1.18, x: 0 },
    xaxis: { title: { text: xAxisLabel, standoff: 12 }, zeroline: false },
    yaxis: { title: { text: t('plot.axisConsumption'), standoff: 8 }, zeroline: false },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
  };

  return (
    <section className="card h-100">
      <div className="card-body">
        <h3 className="card-title h6">{title}</h3>
        <Plot
          config={{ displayModeBar: false, responsive: true }}
          data={traces}
          layout={layout}
          style={{ width: '100%' }}
          useResizeHandler
        />
        <details className="mt-2">
          <summary className="small text-body-secondary">{t('plot.regressionResults')}</summary>
          <dl className="row small mb-0 mt-2">
            <dt className="col-4">{t('plot.equation')}</dt>
            <dd className="col-8 font-monospace">{model.string}</dd>
            <dt className="col-4">{t('plot.r2')}</dt>
            <dd className="col-8">{model.r2.toFixed(4)}</dd>
          </dl>
        </details>
      </div>
    </section>
  );
}
