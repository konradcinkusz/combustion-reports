import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// plotly.js reaches for `URL.createObjectURL` at module-evaluation time to build
// its icon sprites. jsdom does not implement it, and the pre-1.0 test suite
// failed on exactly this before it could run a single assertion.
if (typeof globalThis.URL.createObjectURL !== 'function') {
  globalThis.URL.createObjectURL = () => 'blob:test';
  globalThis.URL.revokeObjectURL = () => {};
}

// jsdom has no layout engine, so plotly cannot measure or draw. The component
// under test is our wrapper — that the chart renders pixels is plotly's
// business, not this suite's. `src/components/Plot.jsx` exists partly so this
// stub has a single, first-party module to replace.
vi.mock('../components/Plot.jsx', () => ({
  default: ({ data }) => <div data-testid="plot" data-traces={data.length} />,
}));

afterEach(() => {
  cleanup();
  globalThis.localStorage?.clear();
});
