import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createAppStore } from '../store/index.js';
import { I18nProvider } from '../i18n/index.jsx';

/**
 * Render a component inside the providers the real app mounts it under.
 *
 * The locale is pinned to English so assertions read as English regardless of
 * the machine's `navigator.languages`, which otherwise makes tests pass locally
 * and fail in CI.
 */
export function renderWithProviders(ui, { preloadedState, route = '/', locale = 'en' } = {}) {
  const store = createAppStore(preloadedState);

  const result = render(
    <Provider store={store}>
      <I18nProvider initialLocale={locale}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </I18nProvider>
    </Provider>,
  );

  return { ...result, store };
}
