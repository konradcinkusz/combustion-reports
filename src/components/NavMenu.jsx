import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/index.jsx';
import { LOCALES } from '../i18n/index.jsx';

const LINKS = [
  { to: '/', key: 'nav.reports', end: true },
  { to: '/cars', key: 'nav.cars' },
  { to: '/fuels', key: 'nav.fuels' },
  { to: '/about', key: 'nav.about' },
];

export default function NavMenu() {
  const { t, locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header>
      <nav className="navbar navbar-expand-sm navbar-light bg-light border-bottom">
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            {t('app.title')}
          </NavLink>

          <button
            aria-controls="main-nav"
            aria-expanded={open}
            aria-label={t('nav.toggle')}
            className="navbar-toggler"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse${open ? ' show' : ''}`} id="main-nav">
            <ul className="navbar-nav me-auto">
              {LINKS.map((link) => (
                <li className="nav-item" key={link.to}>
                  <NavLink
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    end={link.end}
                    onClick={() => setOpen(false)}
                    to={link.to}
                  >
                    {t(link.key)}
                  </NavLink>
                </li>
              ))}
            </ul>

            <label className="d-flex align-items-center gap-2 mb-0">
              <span className="visually-hidden">{t('common.language')}</span>
              <select
                className="form-select form-select-sm w-auto"
                onChange={(event) => setLocale(event.target.value)}
                value={locale}
              >
                {Object.entries(LOCALES).map(([code, { label }]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </nav>
    </header>
  );
}
