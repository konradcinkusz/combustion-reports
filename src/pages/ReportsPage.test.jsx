import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportsPage from './ReportsPage.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';

describe('ReportsPage', () => {
  it('shows the seeded reports for the initially selected car', () => {
    renderWithProviders(<ReportsPage />);

    // Mazda is first in the seed data and has four reports.
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('switches the report list when another car is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.selectOptions(screen.getByLabelText('Select a car'), 'seed-car-toyota');

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('adds a report and puts it in the list', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<ReportsPage />);

    await user.type(screen.getByLabelText('Route length (km)'), '220');
    await user.type(screen.getByLabelText('Average consumption (l/100km)'), '6.2');
    await user.type(screen.getByLabelText('Average speed (km/h)'), '95');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(store.getState().reports.at(-1)).toMatchObject({
      carId: 'seed-car-mazda',
      routeKilometers: 220,
      averageCombustion: 6.2,
      averageSpeed: 95,
    });
  });

  it('keeps submit disabled until every field is valid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    const submit = screen.getByRole('button', { name: 'Add' });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText('Route length (km)'), '100');
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText('Average consumption (l/100km)'), '6');
    await user.type(screen.getByLabelText('Average speed (km/h)'), '80');
    expect(submit).toBeEnabled();
  });

  it('reports a non-numeric value once the field is touched', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    const field = screen.getByLabelText('Average speed (km/h)');
    await user.type(field, 'fast');
    await user.tab();

    expect(screen.getByText(/must be a number/)).toBeInTheDocument();
  });

  it('deletes a report through its own control, not by clicking the row', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<ReportsPage />);

    const before = store.getState().reports.length;
    const firstRow = screen.getAllByRole('listitem')[0];
    await user.click(within(firstRow).getByRole('button'));

    expect(store.getState().reports).toHaveLength(before - 1);
  });

  it('tells the user to add a car when there are none', () => {
    renderWithProviders(<ReportsPage />, { preloadedState: { fuels: [], cars: [], reports: [] } });

    expect(screen.getByText(/Add a car first/)).toBeInTheDocument();
  });

  it('renders the not-enough-data notice instead of a chart for a car with one report', () => {
    renderWithProviders(<ReportsPage />, {
      preloadedState: {
        fuels: [],
        cars: [{ id: 'c1', name: 'Solo', fuelId: null, catalogueCityCombustion: 7, catalogueRouteCombustion: 5 }],
        reports: [{ id: 'r1', carId: 'c1', routeKilometers: 10, averageCombustion: 6, averageSpeed: 40 }],
      },
    });

    expect(screen.getAllByText(/Not enough data to fit a curve/)).toHaveLength(2);
  });
});
