import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App.jsx';
import { renderWithProviders } from './test/renderWithProviders.jsx';

/**
 * Every route is rendered here on purpose.
 *
 * The pre-1.0 app shipped a /route page that threw
 * `Cannot read properties of undefined (reading 'string')` and rendered a blank
 * screen. Its only test rendered `<App />` at `/` and could not have caught it —
 * and in fact never ran at all, because plotly could not load under jsdom.
 */
describe('App routing', () => {
  const routes = [
    { path: '/', heading: 'Combustion reports' },
    { path: '/cars', heading: 'Cars' },
    { path: '/fuels', heading: 'Fuels' },
    { path: '/about', heading: 'About' },
  ];

  it.each(routes)('renders $path without crashing', ({ path, heading }) => {
    renderWithProviders(<App />, { route: path });

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('redirects an unknown route to the reports page', () => {
    renderWithProviders(<App />, { route: '/does-not-exist' });

    expect(screen.getByRole('heading', { level: 1, name: 'Combustion reports' })).toBeInTheDocument();
  });

  it('renders every route with an empty store, not just with seed data', () => {
    // Charts, summaries and lists all have to cope with nothing to show.
    for (const { path } of routes) {
      const { unmount } = renderWithProviders(<App />, {
        route: path,
        preloadedState: { fuels: [], cars: [], reports: [] },
      });
      unmount();
    }
  });
});
