import { useI18n } from '../i18n/index.jsx';

/**
 * A list of records with a delete control per row.
 *
 * The pre-1.0 `Items` component made the whole row a `<button>` whose click
 * handler deleted the record — a single misclick destroyed data with no
 * affordance saying so. Here the row is text and only the explicit, labelled
 * delete control removes anything.
 */
export default function ItemList({ items, onDelete, emptyMessage }) {
  const { t } = useI18n();

  if (items.length === 0) {
    return <p className="text-body-secondary mb-0">{emptyMessage}</p>;
  }

  return (
    <ul className="list-group">
      {items.map((item) => (
        <li className="list-group-item d-flex justify-content-between align-items-center gap-3" key={item.id}>
          <span>{item.label}</span>
          {onDelete ? (
            <button
              aria-label={t('common.remove', { name: item.label })}
              className="btn btn-outline-danger btn-sm flex-shrink-0"
              onClick={() => onDelete(item.id)}
              type="button"
            >
              {t('common.delete')}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
