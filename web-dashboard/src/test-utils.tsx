// Test setup utilities for React component testing
import '@testing-library/jest-dom';
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/slices/authSlice';
import dashboardReducer from './store/slices/dashboardSlice';
import reportsReducer from './store/slices/reportsSlice';
import animalsReducer from './store/slices/animalsSlice';
import cropsReducer from './store/slices/cropsSlice';
import tasksReducer from './store/slices/tasksSlice';
import usersReducer from './store/slices/usersSlice';

// Mock Router for testing - avoids ESM issues with react-router-dom v7
const MockRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;


// Define RootState type based on actual store
export interface RootState {
  auth: ReturnType<typeof authReducer>;
  dashboard: ReturnType<typeof dashboardReducer>;
  reports: ReturnType<typeof reportsReducer>;
  animals: ReturnType<typeof animalsReducer>;
  crops: ReturnType<typeof cropsReducer>;
  tasks: ReturnType<typeof tasksReducer>;
  users: ReturnType<typeof usersReducer>;
}

// Create a test store
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      dashboard: dashboardReducer,
      reports: reportsReducer,
      animals: animalsReducer,
      crops: cropsReducer,
      tasks: tasksReducer,
      users: usersReducer,
    } as any,
    preloadedState: preloadedState as any,
  });
}

// Custom render with providers
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof setupStore>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MockRouter>{children}</MockRouter>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock localStorage
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Setup localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Re-export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
