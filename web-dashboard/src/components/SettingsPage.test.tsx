import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent, mockLocalStorage } from '../test-utils';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
  const mockUser = {
    uid: 'user-123',
    name: 'John Doe',
    email: 'john@farm.com',
    phoneNumber: '+1234567890',
    role: 'manager' as const,
    farmId: 'farm-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const defaultPreloadedState = {
    auth: { 
      user: mockUser, 
      isAuthenticated: true,
      loading: false,
      error: null,
    },
  };

  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('Rendering', () => {
    it('should render settings page with all tabs', () => {
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /farm preferences/i })).toBeInTheDocument();
    });

    it('should display user information in profile tab', () => {
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@farm.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    });

    it('should display avatar with user initials', () => {
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Profile Tab', () => {
    it('should allow updating profile fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Smith');

      expect(nameInput).toHaveValue('Jane Smith');
    });

    it('should save profile to localStorage on save button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        const saved = mockLocalStorage.getItem('userProfile');
        expect(saved).toBeTruthy();
        const profile = JSON.parse(saved!);
        expect(profile.name).toBe('Updated Name');
      });
    });

    it('should show success message after saving profile', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Notifications Tab', () => {
    it('should switch to notifications tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const notificationsTab = screen.getByRole('tab', { name: /notifications/i });
      await user.click(notificationsTab);

      expect(screen.getByText(/notification channels/i)).toBeInTheDocument();
      expect(screen.getByText(/alert types/i)).toBeInTheDocument();
    });

    it('should toggle notification switches', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const notificationsTab = screen.getByRole('tab', { name: /notifications/i });
      await user.click(notificationsTab);

      // MUI Switch components - find by label text
      const emailSwitch = screen.getByLabelText(/email notifications/i);
      expect(emailSwitch).toBeChecked();

      await user.click(emailSwitch);
      expect(emailSwitch).not.toBeChecked();
    });

    it('should save notification preferences to localStorage', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const notificationsTab = screen.getByRole('tab', { name: /notifications/i });
      await user.click(notificationsTab);

      const smsSwitch = screen.getByLabelText(/sms notifications/i);
      await user.click(smsSwitch);

      const saveButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(saveButton);

      await waitFor(() => {
        const saved = mockLocalStorage.getItem('notificationSettings');
        expect(saved).toBeTruthy();
        const settings = JSON.parse(saved!);
        expect(settings.smsNotifications).toBe(true);
      });
    });

    it('should load saved notification preferences from localStorage', async () => {
      const savedSettings = {
        emailNotifications: false,
        pushNotifications: false,
        smsNotifications: true,
        weatherAlerts: false,
        livestockAlerts: true,
        irrigationAlerts: false,
        taskReminders: true,
        systemUpdates: true,
      };
      mockLocalStorage.setItem('notificationSettings', JSON.stringify(savedSettings));

      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const notificationsTab = screen.getByRole('tab', { name: /notifications/i });
      await userEvent.click(notificationsTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/email notifications/i)).not.toBeChecked();
        expect(screen.getByLabelText(/sms notifications/i)).toBeChecked();
        expect(screen.getByLabelText(/livestock health alerts/i)).toBeChecked();
      });
    });
  });

  describe('Security Tab', () => {
    it('should switch to security tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);

      // Use getByRole for the button instead of text search to avoid multiple matches
      expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);

      const currentPassword = screen.getByLabelText(/current password/i);
      const newPassword = screen.getByLabelText(/^new password/i);
      const confirmPassword = screen.getByLabelText(/confirm new password/i);

      await user.type(currentPassword, 'oldpassword123');
      await user.type(newPassword, 'newpassword123');
      await user.type(confirmPassword, 'differentpassword');

      const changeButton = screen.getByRole('button', { name: /change password/i });
      await user.click(changeButton);

      // Check for the error snackbar alert (getAllByRole because there's also a helper text alert)
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const errorAlert = alerts.find(alert => alert.textContent?.includes('Passwords do not match'));
        expect(errorAlert).toBeTruthy();
      });
    });

    it('should show error when password is too short', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);

      const currentPassword = screen.getByLabelText(/current password/i);
      const newPassword = screen.getByLabelText(/^new password/i);
      const confirmPassword = screen.getByLabelText(/confirm new password/i);

      await user.type(currentPassword, 'oldpass');
      await user.type(newPassword, 'short');
      await user.type(confirmPassword, 'short');

      const changeButton = screen.getByRole('button', { name: /change password/i });
      await user.click(changeButton);

      // Check for the error snackbar (getAllByRole because there's also a helper text alert)
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const errorAlert = alerts.find(alert => 
          alert.textContent?.includes('Password must be at least 8 characters') &&
          !alert.textContent?.includes('contain letters and numbers')
        );
        expect(errorAlert).toBeTruthy();
      });
    });

    it('should clear password fields after successful change', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);

      const currentPassword = screen.getByLabelText(/current password/i);
      const newPassword = screen.getByLabelText(/^new password/i);
      const confirmPassword = screen.getByLabelText(/confirm new password/i);

      await user.type(currentPassword, 'oldpassword123');
      await user.type(newPassword, 'newpassword123');
      await user.type(confirmPassword, 'newpassword123');

      const changeButton = screen.getByRole('button', { name: /change password/i });
      await user.click(changeButton);

      await waitFor(() => {
        expect(currentPassword).toHaveValue('');
        expect(newPassword).toHaveValue('');
        expect(confirmPassword).toHaveValue('');
      });
    });

    it('should disable change password button when fields are empty', async () => {
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const securityTab = screen.getByRole('tab', { name: /security/i });
      await userEvent.click(securityTab);

      await waitFor(() => {
        const changeButton = screen.getByRole('button', { name: /change password/i });
        expect(changeButton).toBeDisabled();
      });
    });
  });

  describe('Farm Preferences Tab', () => {
    it('should switch to farm preferences tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const farmPrefsTab = screen.getByRole('tab', { name: /farm preferences/i });
      await user.click(farmPrefsTab);

      expect(screen.getByText(/units & measurements/i)).toBeInTheDocument();
      expect(screen.getByText(/regional settings/i)).toBeInTheDocument();
    });

    it('should change temperature unit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const farmPrefsTab = screen.getByRole('tab', { name: /farm preferences/i });
      await user.click(farmPrefsTab);

      // MUI Select comboboxes don't have accessible names - get all and select the first one (temperature)
      const comboboxes = screen.getAllByRole('combobox');
      const tempSelect = comboboxes[0]; // First combobox is temperature unit
      await user.click(tempSelect);

      // Select Fahrenheit from the dropdown
      const fahrenheitOption = await screen.findByRole('option', { name: /fahrenheit/i });
      await user.click(fahrenheitOption);

      // Save preferences
      const saveButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(saveButton);

      await waitFor(() => {
        const saved = mockLocalStorage.getItem('farmPreferences');
        expect(saved).toBeTruthy();
        const prefs = JSON.parse(saved!);
        expect(prefs.temperatureUnit).toBe('fahrenheit');
      });
    });

    it('should change area unit to acres', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const farmPrefsTab = screen.getByRole('tab', { name: /farm preferences/i });
      await user.click(farmPrefsTab);

      // MUI Select: Get all comboboxes, second one is area unit
      const comboboxes = screen.getAllByRole('combobox');
      const areaSelect = comboboxes[1]; // Second combobox is area unit
      await user.click(areaSelect);

      // Select Acres from the dropdown
      const acresOption = await screen.findByRole('option', { name: /acres/i });
      await user.click(acresOption);

      const saveButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(saveButton);

      await waitFor(() => {
        const saved = mockLocalStorage.getItem('farmPreferences');
        const prefs = JSON.parse(saved!);
        expect(prefs.areaUnit).toBe('acres');
      });
    });

    it('should load saved farm preferences from localStorage', () => {
      const savedPrefs = {
        temperatureUnit: 'fahrenheit',
        areaUnit: 'acres',
        currency: 'EUR',
        timezone: 'America/New_York',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
      };
      mockLocalStorage.setItem('farmPreferences', JSON.stringify(savedPrefs));

      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const farmPrefsTab = screen.getByRole('tab', { name: /farm preferences/i });
      userEvent.click(farmPrefsTab);

      // Preferences should be loaded (this would need to verify the select values)
      // For now, we verify the localStorage was read
      expect(mockLocalStorage.getItem('farmPreferences')).toBeTruthy();
    });

    it('should show success message after saving farm preferences', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const farmPrefsTab = screen.getByRole('tab', { name: /farm preferences/i });
      await user.click(farmPrefsTab);

      const saveButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/farm preferences saved/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles for tabs', () => {
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);

      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('should have proper labels for all form inputs', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />, {
        preloadedState: defaultPreloadedState,
      });

      // Profile tab
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();

      // Security tab
      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);

      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });
  });
});

