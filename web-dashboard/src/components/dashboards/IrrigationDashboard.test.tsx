import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils';
import IrrigationDashboard from './IrrigationDashboard';
import { irrigationService } from '../../services/irrigation';

// Mock the irrigation service
jest.mock('../../services/irrigation');

const mockIrrigationService = irrigationService as jest.Mocked<typeof irrigationService>;

describe.skip('IrrigationDashboard Component', () => {
  const mockZones = [
    {
      id: 'zone1',
      name: 'North Field A',
      area: 5.0,
      cropType: 'Corn',
      status: 'active' as const,
      soilMoisture: 65,
      temperature: 25,
      humidity: 60,
      lastWatered: '2025-11-12T08:00:00Z',
      nextScheduled: '2025-11-12T18:00:00Z',
      waterUsage: 1200,
      flowRate: 25,
      pressure: 45,
      valveStatus: 'open' as const,
      sensorBattery: 85,
      schedule: [],
      recommendations: [],
      efficiency: 92,
      coordinates: { lat: 0, lng: 0 },
    },
    {
      id: 'zone2',
      name: 'South Field B',
      area: 3.5,
      cropType: 'Tomatoes',
      status: 'scheduled' as const,
      soilMoisture: 35,
      temperature: 27,
      humidity: 55,
      lastWatered: '2025-11-11T14:00:00Z',
      nextScheduled: '2025-11-12T12:00:00Z',
      waterUsage: 800,
      flowRate: 20,
      pressure: 42,
      valveStatus: 'closed' as const,
      sensorBattery: 78,
      schedule: [],
      recommendations: [],
      efficiency: 88,
      coordinates: { lat: 0, lng: 0 },
    },
    {
      id: 'zone3',
      name: 'East Orchard',
      area: 8.0,
      cropType: 'Apple Trees',
      status: 'inactive' as const,
      soilMoisture: 20,
      temperature: 24,
      humidity: 65,
      lastWatered: '2025-11-10T10:00:00Z',
      nextScheduled: '2025-11-13T08:00:00Z',
      waterUsage: 1500,
      flowRate: 30,
      pressure: 48,
      valveStatus: 'closed' as const,
      sensorBattery: 92,
      schedule: [],
      recommendations: [],
      efficiency: 85,
      coordinates: { lat: 0, lng: 0 },
    },
  ];

  const mockUser = {
    uid: 'user123',
    email: 'farmer@test.com',
    name: 'Test Farmer',
    farmId: 'farm123',
    role: 'manager' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('farmId', 'farm123');
    mockIrrigationService.getAllZones.mockResolvedValue(mockZones);
  });

  describe('Rendering', () => {
    it('should render dashboard with title and controls', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      expect(screen.getByText('Irrigation Management Dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText(/system enabled/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add zone/i })).toBeInTheDocument();
    });

    it('should show warning when no farm is selected', () => {
      localStorage.removeItem('farmId');
      
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: { ...mockUser, farmId: undefined }, isAuthenticated: true } },
      });

      expect(screen.getByText(/no farm selected/i)).toBeInTheDocument();
    });

    it('should render summary cards with correct data', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('Irrigation Zone Management')).toBeInTheDocument();
      });

      // Check for active zones card
      const activeZonesCard = screen.getByText('Active Zones').closest('.MuiCardContent-root') as HTMLElement;
      expect(within(activeZonesCard).getByText('1')).toBeInTheDocument();
      
      // Check for water usage
      expect(screen.getByText(/3,500/)).toBeInTheDocument();
      
      // Check for average moisture
      expect(screen.getByText('40%')).toBeInTheDocument();
      
      // Check for alerts card
      const alertsCard = screen.getByText('Alerts').closest('.MuiCardContent-root') as HTMLElement;
      expect(within(alertsCard).getByText('2')).toBeInTheDocument();
    });

    it('should render irrigation zones table with all columns', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      // Check table headers
      expect(screen.getByText('Zone Name')).toBeInTheDocument();
      expect(screen.getByText('Area')).toBeInTheDocument();
      expect(screen.getByText('Crop Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Soil Moisture')).toBeInTheDocument();
      expect(screen.getByText('Flow Rate')).toBeInTheDocument();
    });

    it('should display all zones in the table', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      expect(screen.getByText('South Field B')).toBeInTheDocument();
      expect(screen.getByText('East Orchard')).toBeInTheDocument();
      expect(screen.getByText('Corn')).toBeInTheDocument();
      expect(screen.getByText('Tomatoes')).toBeInTheDocument();
      expect(screen.getByText('Apple Trees')).toBeInTheDocument();
    });

    it('should render quick control buttons', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /emergency irrigation/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /schedule all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /stop all zones/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /system settings/i })).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when fetching zones', () => {
      mockIrrigationService.getAllZones.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should hide loading indicator after data loads', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      // Only moisture progress bars should remain
      const progressBars = screen.queryAllByRole('progressbar');
      expect(progressBars.length).toBe(3); // One for each zone's moisture bar
    });
  });

  describe('Error Handling', () => {
    it('should display error message when zone loading fails', async () => {
      mockIrrigationService.getAllZones.mockRejectedValueOnce(new Error('Failed to load zones'));

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to load zones/i)).toBeInTheDocument();
      });
    });

    it('should clear error message when close button is clicked', async () => {
      const user = userEvent.setup();
      mockIrrigationService.getAllZones.mockRejectedValueOnce(new Error('Failed to load zones'));

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to load zones/i)).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/failed to load zones/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('System Controls', () => {
    it('should toggle system enabled switch', async () => {
      const user = userEvent.setup();

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/system enabled/i)).toBeInTheDocument();
      });

      const systemSwitch = screen.getByLabelText(/system enabled/i);
      expect(systemSwitch).toBeChecked();

      await user.click(systemSwitch);
      expect(systemSwitch).not.toBeChecked();

      await user.click(systemSwitch);
      expect(systemSwitch).toBeChecked();
    });

    it('should toggle emergency mode', async () => {
      const user = userEvent.setup();

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      const emergencyButton = screen.getByRole('button', { name: /emergency irrigation/i });
      await user.click(emergencyButton);

      await waitFor(() => {
        expect(screen.getByText(/emergency irrigation mode activated/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /stop emergency/i })).toBeInTheDocument();
    });
  });

  describe('Low Moisture Alerts', () => {
    it('should show alert for low moisture zones', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText(/2 zone\(s\) have critically low soil moisture levels/i)).toBeInTheDocument();
      });
    });

    it('should not show alert when all zones have adequate moisture', async () => {
      const highMoistureZones = mockZones.map(zone => ({
        ...zone,
        soilMoisture: 60,
      }));
      mockIrrigationService.getAllZones.mockResolvedValueOnce(highMoistureZones);

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      expect(screen.queryByText(/zone\(s\) have critically low soil moisture/i)).not.toBeInTheDocument();
    });
  });

  describe('Zone Toggle Functionality', () => {
    it('should start inactive zone when play button is clicked', async () => {
      const user = userEvent.setup();
      mockIrrigationService.startZone.mockResolvedValueOnce(undefined as any);
      mockIrrigationService.getAllZones.mockResolvedValueOnce(mockZones).mockResolvedValueOnce([
        ...mockZones.slice(0, 1),
        { ...mockZones[1], status: 'active' as const },
        ...mockZones.slice(2),
      ]);

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('South Field B')).toBeInTheDocument();
      });

      const startButtons = screen.getAllByTitle('Start Zone');
      await user.click(startButtons[0]); // Click first start button (South Field B)

      await waitFor(() => {
        expect(mockIrrigationService.startZone).toHaveBeenCalledWith('zone2');
      });
    });

    it('should stop active zone when stop button is clicked', async () => {
      const user = userEvent.setup();
      mockIrrigationService.stopZone.mockResolvedValueOnce(undefined as any);
      mockIrrigationService.getAllZones.mockResolvedValueOnce(mockZones).mockResolvedValueOnce([
        { ...mockZones[0], status: 'inactive' as const },
        ...mockZones.slice(1),
      ]);

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      const stopButtons = screen.getAllByTitle('Stop Zone');
      await user.click(stopButtons[0]); // Click stop button for North Field A

      await waitFor(() => {
        expect(mockIrrigationService.stopZone).toHaveBeenCalledWith('zone1');
      });
    });

    it('should handle toggle zone error', async () => {
      const user = userEvent.setup();
      mockIrrigationService.startZone.mockRejectedValueOnce(new Error('Failed to start zone'));

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('South Field B')).toBeInTheDocument();
      });

      const startButtons = screen.getAllByTitle('Start Zone');
      await user.click(startButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/failed to start zone/i)).toBeInTheDocument();
      });
    });
  });

  describe('Add Zone Dialog', () => {
    it('should open dialog when add button is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add zone/i })).toBeEnabled();
      });

      const addButton = screen.getByRole('button', { name: /add zone/i });
      await user.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Irrigation Zone')).toBeInTheDocument();
    });

    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add zone/i })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /add zone/i }));
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should render all form fields in add dialog', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add zone/i })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /add zone/i }));

      expect(screen.getByLabelText(/zone name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/area \(hectares\)/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Crop Type select
      expect(screen.getByLabelText(/flow rate/i)).toBeInTheDocument();
    });

    it('should show error when submitting with missing fields', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add zone/i })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /add zone/i }));
      
      const dialog = screen.getByRole('dialog');
      const addButton = within(dialog).getByRole('button', { name: /add zone/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
      });
    });

    it('should successfully add new zone with all fields filled', async () => {
      const user = userEvent.setup();
      const newZone = {
        id: 'zone4',
        name: 'West Field C',
        area: 4.5,
        cropType: 'Rice',
        status: 'inactive' as const,
        soilMoisture: 50,
        temperature: 25,
        humidity: 60,
        lastWatered: '2025-11-12T08:00:00Z',
        nextScheduled: '2025-11-12T18:00:00Z',
        waterUsage: 0,
        flowRate: 22,
        pressure: 44,
        valveStatus: 'closed' as const,
        sensorBattery: 100,
        schedule: [],
        recommendations: [],
        efficiency: 90,
        coordinates: { lat: 0, lng: 0 },
      };

      mockIrrigationService.createZone.mockResolvedValueOnce(newZone as any);
      mockIrrigationService.getAllZones.mockResolvedValueOnce(mockZones).mockResolvedValueOnce([...mockZones, newZone]);

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add zone/i })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /add zone/i }));

      // Fill in the form
      await user.type(screen.getByLabelText(/zone name/i), 'West Field C');
      await user.type(screen.getByLabelText(/area \(hectares\)/i), '4.5');
      await user.type(screen.getByLabelText(/flow rate/i), '22');

      // Select crop type
      const cropTypeSelect = screen.getByRole('combobox');
      await user.click(cropTypeSelect);
      const riceOption = screen.getByRole('option', { name: /rice/i });
      await user.click(riceOption);

      // Submit the form
      const dialog = screen.getByRole('dialog');
      const addButton = within(dialog).getByRole('button', { name: /add zone/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(mockIrrigationService.createZone).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should handle create zone API error', async () => {
      const user = userEvent.setup();
      mockIrrigationService.createZone.mockRejectedValueOnce(new Error('Failed to create zone'));

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add zone/i })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /add zone/i }));

      // Fill required fields
      await user.type(screen.getByLabelText(/zone name/i), 'Test Zone');
      await user.type(screen.getByLabelText(/area \(hectares\)/i), '5');
      await user.type(screen.getByLabelText(/flow rate/i), '20');

      const cropTypeSelect = screen.getByRole('combobox');
      await user.click(cropTypeSelect);
      await user.click(screen.getByRole('option', { name: /corn/i }));

      const dialog = screen.getByRole('dialog');
      const addButton = within(dialog).getByRole('button', { name: /add zone/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create zone/i)).toBeInTheDocument();
      });
    });
  });

  describe('Delete Zone Functionality', () => {
    it('should show delete button for each zone', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete');
      expect(deleteButtons).toHaveLength(3);
    });

    it('should show confirmation dialog before deleting', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete');
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this irrigation zone?');
      expect(mockIrrigationService.deleteZone).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('should delete zone when confirmed', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockIrrigationService.deleteZone.mockResolvedValueOnce(undefined as any);
      mockIrrigationService.getAllZones.mockResolvedValueOnce(mockZones).mockResolvedValueOnce(mockZones.slice(1));

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockIrrigationService.deleteZone).toHaveBeenCalledWith('zone1');
      });

      await waitFor(() => {
        expect(mockIrrigationService.getAllZones).toHaveBeenCalledTimes(2);
      });

      confirmSpy.mockRestore();
    });

    it('should handle delete error gracefully', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockIrrigationService.deleteZone.mockRejectedValueOnce(new Error('Failed to delete zone'));

      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/failed to delete zone/i)).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });
  });

  describe('Zone Status Display', () => {
    it('should display correct status chips with colors', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('scheduled')).toBeInTheDocument();
      expect(screen.getByText('inactive')).toBeInTheDocument();
    });

    it('should display soil moisture progress bars', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      expect(screen.getByText('65%')).toBeInTheDocument(); // North Field A
      expect(screen.getByText('35%')).toBeInTheDocument(); // South Field B
      expect(screen.getByText('20%')).toBeInTheDocument(); // East Orchard
    });

    it('should display flow rates', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      expect(screen.getByText('25 GPM')).toBeInTheDocument();
      expect(screen.getByText('20 GPM')).toBeInTheDocument();
      expect(screen.getByText('30 GPM')).toBeInTheDocument();
    });
  });

  describe('Data Calculations', () => {
    it('should calculate total water usage correctly', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText(/3,500/)).toBeInTheDocument(); // 1200 + 800 + 1500
      });
    });

    it('should calculate active zones correctly', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        const activeZoneElements = screen.getAllByText('1');
        expect(activeZoneElements.length).toBeGreaterThan(0);
      });
    });

    it('should calculate average moisture correctly', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        // Average: (65 + 35 + 20) / 3 = 40%
        expect(screen.getByText('40%')).toBeInTheDocument();
      });
    });

    it('should count low moisture zones correctly', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        const lowMoistureElements = screen.getAllByText('2'); // Zones with moisture < 40
        expect(lowMoistureElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly in the table', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      // Check that dates are formatted (format depends on locale)
      const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}/;
      const tableCells = screen.getAllByRole('cell');
      const dateTexts = tableCells.filter(cell => datePattern.test(cell.textContent || ''));
      expect(dateTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add zone/i })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /add zone/i }));

      expect(screen.getByLabelText(/zone name/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/area \(hectares\)/i)).toHaveAttribute('type', 'number');
      expect(screen.getByLabelText(/flow rate/i)).toHaveAttribute('type', 'number');
    });

    it('should have proper button labels and titles', async () => {
      renderWithProviders(<IrrigationDashboard />, {
        preloadedState: { auth: { user: mockUser, isAuthenticated: true, loading: false, error: null } },
      });

      await waitFor(() => {
        expect(screen.getByText('North Field A')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /add zone/i })).toBeInTheDocument();
      expect(screen.getAllByTitle('Edit')[0]).toBeInTheDocument();
      expect(screen.getAllByTitle('Delete')[0]).toBeInTheDocument();
    });
  });
});
