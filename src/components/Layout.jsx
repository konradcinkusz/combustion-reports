import NavMenu from './NavMenu.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function Layout({ children }) {
  const { t } = useI18n();

  return (
    <>
      <NavMenu />
      <main className="container py-4">{children}</main>
      <footer className="container py-4 text-body-secondary border-top mt-4">
        <small>
          {t('app.title')} ·{' '}
          <a href="https://github.com/konradcinkusz/CombustionReports" rel="noreferrer" target="_blank">
            GitHub
          </a>
        </small>
      </footer>
    </>
  );
}
