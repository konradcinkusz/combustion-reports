import { useI18n } from '../i18n/index.jsx';
import { clearState } from '../store/persistence.js';

export default function AboutPage() {
  const { t } = useI18n();

  function handleReset() {
    // Destructive and irreversible, so it asks first.
    if (!globalThis.confirm(t('about.resetConfirm'))) return;
    clearState();
    globalThis.location.reload();
  }

  return (
    <>
      <h1 className="h3">{t('about.heading')}</h1>
      <p>{t('about.body')}</p>

      <h2 className="h5 mt-4">{t('about.storageHeading')}</h2>
      <p>{t('about.storageBody')}</p>

      <button className="btn btn-outline-danger" onClick={handleReset} type="button">
        {t('about.reset')}
      </button>
    </>
  );
}
