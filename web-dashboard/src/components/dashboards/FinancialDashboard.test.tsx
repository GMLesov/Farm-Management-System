import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import FinancialDashboard from './FinancialDashboard';

describe.skip('FinancialDashboard Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderWithProviders(<FinancialDashboard />);
      expect(container).toBeTruthy();
    });

    it('should display interactive elements', () => {
      renderWithProviders(<FinancialDashboard />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should contain financial data', () => {
      const { container } = renderWithProviders(<FinancialDashboard />);
      
      // Should have content
      expect(container.textContent).toBeTruthy();
    });
  });
});
