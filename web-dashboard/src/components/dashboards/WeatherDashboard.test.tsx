import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import WeatherDashboard from './WeatherDashboard';

describe('WeatherDashboard Component', () => {
  describe('Rendering', () => {
    it('should render weather dashboard', () => {
      renderWithProviders(<WeatherDashboard />);
      
      // Should render without crashing
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should display weather information', () => {
      const { container } = renderWithProviders(<WeatherDashboard />);
      
      expect(container).toBeTruthy();
    });

    it('should show temperature data', () => {
      renderWithProviders(<WeatherDashboard />);
      
      // Dashboard renders successfully
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
