import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App.jsx';
import { store } from './store/index.js';
import { I18nProvider } from './i18n/index.jsx';
import './styles.css';

// HashRouter rather than BrowserRouter: the app ships as static files, and the
// deploy targets it is built for (GitHub Pages, Firebase Hosting previews,
// `npm run preview`) would otherwise 404 on a refresh of any route but `/`.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <I18nProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </I18nProvider>
    </Provider>
  </StrictMode>,
);
