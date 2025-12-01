import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import MainDashboard from './MainDashboard';

describe.skip('MainDashboard Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderWithProviders(<MainDashboard />);
      expect(container).toBeTruthy();
    });

    it('should display interactive elements', () => {
      renderWithProviders(<MainDashboard />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should contain dashboard content', () => {
      const { container } = renderWithProviders(<MainDashboard />);
      
      // Should have some content
      expect(container.textContent).toBeTruthy();
    });
  });
});
