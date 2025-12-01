import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent, mockLocalStorage } from '../test-utils';
import { apiService } from '../services/api';

// Mock react-router-dom to avoid ESM issues
jest.mock('react-router-dom');
const { mockNavigate } = require('react-router-dom');

// Mock the API service
jest.mock('../services/api');

// Import Login after mocks are set up
import Login from './Login';

// Setup API service mock methods
const mockApiPost = apiService.post as jest.MockedFunction<typeof apiService.post>;
const mockSetAuthToken = apiService.setAuthToken as jest.MockedFunction<typeof apiService.setAuthToken>;

describe('Login Component', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    mockApiPost.mockReset();
    mockSetAuthToken.mockReset();
    mockNavigate.mockReset();
  });

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      renderWithProviders(<Login />);

      // Use getAllByText since "Farm Manager" appears in both heading and link text
      expect(screen.getAllByText(/Farm Manager/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Sign in to your farm management portal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/New to Farm Manager/i)).toBeInTheDocument();
    });

    it('should render remember me checkbox', () => {
      renderWithProviders(<Login />);

      const rememberMe = screen.getByRole('checkbox', { name: /remember me/i });
      expect(rememberMe).toBeInTheDocument();
      expect(rememberMe).not.toBeChecked();
    });

    it('should render forgot password link', () => {
      renderWithProviders(<Login />);

      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting empty form', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
      });
    });

    it('should show error when email is missing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is missing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Trigger an error first
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
      });

      // Type in email field
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      // Error should be cleared
      expect(screen.queryByText(/please fill in all fields/i)).not.toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when icon is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      // Find and click the visibility toggle button
      const toggleButton = screen.getByRole('button', { name: '' }); // Icon button without label
      await user.click(toggleButton);

      await waitFor(() => {
        expect(passwordInput.type).toBe('text');
      });

      // Click again to hide
      await user.click(toggleButton);

      await waitFor(() => {
        expect(passwordInput.type).toBe('password');
      });
    });
  });

  describe('Remember Me Functionality', () => {
    it('should toggle remember me checkbox', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      expect(rememberMeCheckbox).not.toBeChecked();

      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();

      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).not.toBeChecked();
    });
  });

  describe('Successful Login', () => {
    it('should login successfully and navigate to dashboard', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          token: 'fake-jwt-token',
          user: {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      };

      mockApiPost.mockResolvedValueOnce(mockResponse as any);

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
          email: 'john@example.com',
          password: 'password123',
        });
        expect(mockSetAuthToken).toHaveBeenCalledWith('fake-jwt-token');
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
      });
    });

    it('should store user data in localStorage on successful login', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      };
      const mockResponse = {
        success: true,
        data: {
          token: 'fake-jwt-token',
          user: mockUser,
        },
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const storedUser = mockLocalStorage.getItem('user');
        expect(storedUser).toBeTruthy();
        expect(JSON.parse(storedUser!)).toEqual(mockUser);
      });
    });

    it('should store farmId if provided in user data', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        data: {
          token: 'fake-jwt-token',
          user: {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
            farmId: 'farm-456',
          },
        },
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLocalStorage.getItem('farmId')).toBe('farm-456');
      });
    });

    it('should handle response with token at root level', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        data: {
          token: 'fake-jwt-token',
          user: {
            id: '123',
            name: 'John Doe',
          },
        },
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSetAuthToken).toHaveBeenCalledWith('fake-jwt-token');
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
      });
    });
  });

  describe('Failed Login', () => {
    it('should show error message on login failure', async () => {
      const user = userEvent.setup();
      mockApiPost.mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should show generic error message when error message is not provided', async () => {
      const user = userEvent.setup();
      mockApiPost.mockRejectedValueOnce(new Error());

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed\. please try again/i)).toBeInTheDocument();
      });
    });

    it('should not navigate on failed login', async () => {
      const user = userEvent.setup();
      mockApiPost.mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error when token is missing in response', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '123',
            name: 'John Doe',
          },
          // No token
        },
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/missing token in response/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      
      // Make the API call hang to test loading state
      mockApiPost.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      renderWithProviders(<Login />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });

    it('should display error messages in accessible alert', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(/please fill in all fields/i);
      });
    });
  });
});
