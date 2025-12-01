import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WorkerMobileDashboard from '../WorkerMobileDashboard';

// Mock store
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: { name: 'John Doe' } }) => state,
  },
});

describe('WorkerMobileDashboard', () => {
  beforeEach(() => {
    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn()
        .mockImplementation((success) => Promise.resolve(success({
          coords: {
            latitude: 51.1,
            longitude: 45.3
          }
        }))),
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    });
  });

  it('renders worker mobile dashboard', () => {
    render(
      <Provider store={mockStore}>
        <WorkerMobileDashboard />
      </Provider>
    );
    
    expect(screen.getByText(/My Tasks/i)).toBeInTheDocument();
  });

  it('displays task list', () => {
    render(
      <Provider store={mockStore}>
        <WorkerMobileDashboard />
      </Provider>
    );
    
    expect(screen.getByText(/Feed cattle in Barn A/i)).toBeInTheDocument();
    expect(screen.getByText(/Check irrigation system/i)).toBeInTheDocument();
  });

  it('starts and stops task timer', async () => {
    render(
      <Provider store={mockStore}>
        <WorkerMobileDashboard />
      </Provider>
    );
    
    const startButton = screen.getAllByText(/Start/i)[0];
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Stop/i)).toBeInTheDocument();
    });
  });

  it('verifies GPS location', async () => {
    render(
      <Provider store={mockStore}>
        <WorkerMobileDashboard />
      </Provider>
    );
    
    const verifyButton = screen.getAllByText(/Verify Location/i)[0];
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Location verified/i)).toBeInTheDocument();
    });
  });

  it('opens report concern dialog', () => {
    render(
      <Provider store={mockStore}>
        <WorkerMobileDashboard />
      </Provider>
    );
    
    const reportButton = screen.getByRole('button', { name: /report/i });
    fireEvent.click(reportButton);
    
    expect(screen.getByText(/Report a Concern/i)).toBeInTheDocument();
  });

  it('handles photo upload in concern report', () => {
    render(
      <Provider store={mockStore}>
        <WorkerMobileDashboard />
      </Provider>
    );
    
    const reportButton = screen.getByRole('button', { name: /report/i });
    fireEvent.click(reportButton);
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload photo/i) as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(input.files?.[0]).toBe(file);
  });

  it('detects offline mode', () => {
    // Mock offline event
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(
      <Provider store={mockStore}>
        <WorkerMobileDashboard />
      </Provider>
    );
    
    fireEvent(window, new Event('offline'));
    
    expect(screen.getByText(/offline mode/i)).toBeInTheDocument();
  });
});
