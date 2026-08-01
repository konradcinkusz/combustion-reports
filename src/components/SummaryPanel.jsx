import { useI18n } from '../i18n/index.jsx';
import { formatInteger, formatNumber } from '../format.js';

/** Headline statistics for the currently selected car. */
export default function SummaryPanel({ summary, cost }) {
  const { t, locale } = useI18n();

  const tiles = [
    { label: t('summary.count'), value: formatInteger(summary.count, locale) },
    { label: t('summary.totalKilometers'), value: `${formatInteger(summary.totalKilometers, locale)} km` },
    { label: t('summary.totalLitres'), value: `${formatNumber(summary.totalLitres, locale)} l` },
    { label: t('summary.averageCombustion'), value: `${formatNumber(summary.averageCombustion, locale)} l/100km` },
    { label: t('summary.best'), value: `${formatNumber(summary.bestCombustion, locale)} l/100km` },
    { label: t('summary.worst'), value: `${formatNumber(summary.worstCombustion, locale)} l/100km` },
    { label: t('summary.cost'), value: formatNumber(cost, locale, { digits: 2 }) },
  ];

  return (
    <section className="mb-4">
      <h2 className="h5">{t('summary.heading')}</h2>
      <div className="row row-cols-2 row-cols-md-4 g-2">
        {tiles.map((tile) => (
          <div className="col" key={tile.label}>
            <div className="border rounded p-2 h-100">
              <div className="text-body-secondary small">{tile.label}</div>
              <div className="fw-semibold">{tile.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
