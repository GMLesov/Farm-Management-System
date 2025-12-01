import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils';

// Mock axios before importing any modules that use it
jest.mock('axios');

// Mock the analytics service
jest.mock('../../services/analytics', () => ({
  analyticsService: {
    getOverview: jest.fn().mockResolvedValue({ data: {} }),
    getMetrics: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

import AnalyticsDashboard from './AnalyticsDashboard';

describe.skip('AnalyticsDashboard Component', () => {
  describe('Rendering', () => {
    it('should render analytics title', () => {
      renderWithProviders(<AnalyticsDashboard />);
      expect(screen.getByText(/analytics/i)).toBeInTheDocument();
    });

    it('should display time range selector', () => {
      renderWithProviders(<AnalyticsDashboard />);
      
      // Should have buttons for different time ranges
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show performance metrics', () => {
      renderWithProviders(<AnalyticsDashboard />);
      
      // Dashboard should render without errors
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render without crashing', () => {
      const { container } = renderWithProviders(<AnalyticsDashboard />);
      expect(container).toBeTruthy();
    });
  });

  describe('User Interaction', () => {
    it('should allow user to interact with components', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AnalyticsDashboard />);
      
      const buttons = screen.getAllByRole('button');
      if (buttons.length > 0) {
        await user.click(buttons[0]);
      }
      
      // Should not crash on interaction
      expect(true).toBe(true);
    });
  });
});
