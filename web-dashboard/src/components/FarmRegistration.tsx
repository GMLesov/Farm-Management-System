import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Alert,
  Divider,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Agriculture as AgricultureIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import AddressPicker from './AddressPicker';

interface FarmRegistrationData {
  // Farm Information
  farmName: string;
  farmType: string;
  farmSize: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  // Farm Details
  primaryCrops: string[];
  animalTypes: string[];
  farmingMethods: string[];
  // Owner Information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  // Business Information
  businessLicense: string;
  taxId: string;
  insuranceProvider: string;
  // Login Credentials
  password: string;
  confirmPassword: string;
  // Terms and Conditions
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

const steps = [
  'Farm Information',
  'Farm Details',
  'Owner Profile',
  'Business Info',
  'Account Setup'
];

const FarmRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FarmRegistrationData>({
    farmName: '',
    farmType: '',
    farmSize: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      latitude: 0,
      longitude: 0,
    },
    primaryCrops: [],
    animalTypes: [],
    farmingMethods: [],
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    businessLicense: '',
    taxId: '',
    insuranceProvider: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
  });

  const farmTypes = [
    'Crop Farm',
    'Livestock Farm',
    'Mixed Farm (Crops & Livestock)',
    'Dairy Farm',
    'Poultry Farm',
    'Aquaculture',
    'Organic Farm',
    'Greenhouse/Hydroponic',
    'Other'
  ];

  const farmSizes = [
    'Small (< 10 acres)',
    'Medium (10-100 acres)',
    'Large (100-1000 acres)',
    'Very Large (> 1000 acres)'
  ];

  const cropOptions = [
    'Corn', 'Wheat', 'Soybeans', 'Rice', 'Barley', 'Oats',
    'Vegetables', 'Fruits', 'Cotton', 'Sugar Crops', 'Herbs', 'Other'
  ];

  const animalOptions = [
    'Cattle', 'Pigs', 'Chickens', 'Sheep', 'Goats', 
    'Horses', 'Fish', 'Other Poultry', 'Other'
  ];

  const farmingMethodOptions = [
    'Conventional', 'Organic', 'Sustainable', 'Precision Agriculture',
    'Hydroponics', 'Permaculture', 'Regenerative', 'Biodynamic'
  ];

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FarmRegistrationData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Farm Information
        if (!formData.farmName || !formData.farmType || !formData.farmSize) {
          setError('Please fill in all required farm information fields.');
          return false;
        }
        if (!formData.location.address || !formData.location.city || !formData.location.state) {
          setError('Please fill in all required location fields.');
          return false;
        }
        break;
      case 1: // Farm Details
        if (formData.primaryCrops.length === 0 && formData.animalTypes.length === 0) {
          setError('Please select at least one crop type or animal type.');
          return false;
        }
        break;
      case 2: // Owner Profile
        if (!formData.ownerName || !formData.ownerEmail || !formData.ownerPhone) {
          setError('Please fill in all owner information fields.');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.ownerEmail)) {
          setError('Please enter a valid email address.');
          return false;
        }
        break;
      case 3: // Business Info (Optional fields)
        break;
      case 4: // Account Setup
        if (!formData.password || !formData.confirmPassword) {
          setError('Please enter and confirm your password.');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long.');
          return false;
        }
        if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
          setError('Please agree to the terms and conditions and privacy policy.');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      // 1) Register user account
      const [firstName, ...rest] = formData.ownerName.trim().split(' ');
      const lastName = rest.join(' ') || 'User';

      const regResp = await apiService.post<any>('/auth/register', {
        email: formData.ownerEmail,
        password: formData.password,
        firstName: firstName || 'Owner',
        lastName,
        phone: formData.ownerPhone || undefined,
      });

      const token = (regResp as any)?.data?.token || (regResp as any)?.token;
      const user = (regResp as any)?.data?.user || (regResp as any)?.user;

      if (!token) {
        throw new Error('Registration succeeded but no token was returned.');
      }

      // Persist token and user
      apiService.setAuthToken(token);
      try { localStorage.setItem('user', JSON.stringify(user)); } catch {}

      // 2) Create a farm using provided details (best-effort)
      const sizeMap: Record<string, number> = {
        'Small (< 10 acres)': 5,
        'Medium (10-100 acres)': 50,
        'Large (100-1000 acres)': 500,
        'Very Large (> 1000 acres)': 1500,
      };
      const mappedSize = sizeMap[formData.farmSize] ?? 10;

      const farmBody = {
        name: formData.farmName || 'My Farm',
        description: `${formData.farmType || 'Farm'} — Registered via wizard`,
        location: {
          address: formData.location.address || 'Unknown',
          city: formData.location.city || 'Unknown',
          state: formData.location.state || 'Unknown',
          country: formData.location.country || 'Unknown',
          zipCode: formData.location.zipCode || '',
          latitude: Number.isFinite(formData.location.latitude) ? formData.location.latitude : 0,
          longitude: Number.isFinite(formData.location.longitude) ? formData.location.longitude : 0,
        },
        size: mappedSize,
        soilType: 'loam',
        climateZone: 'temperate',
      };

      let farmId: string | undefined;
      try {
        const farmResp = await apiService.post<any>('/farms', farmBody);
        farmId = (farmResp as any)?.data?.data?.id || (farmResp as any)?.data?.id || (farmResp as any)?.data?.data?._id;
      } catch (e) {
        // If farm creation fails, continue to select-farm flow
        console.warn('Farm creation failed, continuing to select-farm. Error:', e);
      }

      if (farmId) {
        try { localStorage.setItem('farmId', String(farmId)); } catch {}
        navigate('/', { replace: true });
      } else {
        navigate('/select-farm', { replace: true });
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              <AgricultureIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Farm Information
            </Typography>
            
            <TextField
              fullWidth
              label="Farm Name *"
              value={formData.farmName}
              onChange={(e) => updateFormData('farmName', e.target.value)}
              placeholder="e.g., Green Valley Farm"
            />
            
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Farm Type *</InputLabel>
                <Select
                  value={formData.farmType}
                  onChange={(e) => updateFormData('farmType', e.target.value)}
                >
                  {farmTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Farm Size *</InputLabel>
                <Select
                  value={formData.farmSize}
                  onChange={(e) => updateFormData('farmSize', e.target.value)}
                >
                  {farmSizes.map((size) => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider />
            <Typography variant="subtitle1">Farm Location</Typography>
            
            <AddressPicker
              label="Street Address *"
              value={formData.location.address}
              onInputChange={(val) => updateFormData('location.address', val)}
              onSelect={(result) => {
                const a: any = result.address || {};
                const city = a.city || a.town || a.village || a.hamlet || a.municipality || '';
                const state = a.state || a.region || a.state_district || a.county || '';
                const address = a.road || a.neighbourhood || a.suburb || result.displayName;
                updateFormData('location.address', address);
                updateFormData('location.city', city);
                updateFormData('location.state', state);
                updateFormData('location.zipCode', a.postcode || '');
                updateFormData('location.country', a.country || '');
                updateFormData('location.latitude', result.lat);
                updateFormData('location.longitude', result.lon);
              }}
            />
            
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="City *"
                value={formData.location.city}
                onChange={(e) => updateFormData('location.city', e.target.value)}
              />
              <TextField
                fullWidth
                label="State/Province *"
                value={formData.location.state}
                onChange={(e) => updateFormData('location.state', e.target.value)}
              />
              <TextField
                fullWidth
                label="ZIP/Postal Code"
                value={formData.location.zipCode}
                onChange={(e) => updateFormData('location.zipCode', e.target.value)}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Country"
              value={formData.location.country}
              onChange={(e) => updateFormData('location.country', e.target.value)}
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Latitude"
                value={formData.location.latitude}
                onChange={(e) => updateFormData('location.latitude', Number(e.target.value))}
                type="number"
              />
              <TextField
                fullWidth
                label="Longitude"
                value={formData.location.longitude}
                onChange={(e) => updateFormData('location.longitude', Number(e.target.value))}
                type="number"
              />
            </Box>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Farm Details
            </Typography>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>Primary Crops</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select all crops you grow on your farm
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {cropOptions.map((crop) => (
                  <FormControlLabel
                    key={crop}
                    control={
                      <Checkbox
                        checked={formData.primaryCrops.includes(crop)}
                        onChange={(e) => {
                          const newCrops = e.target.checked
                            ? [...formData.primaryCrops, crop]
                            : formData.primaryCrops.filter(c => c !== crop);
                          updateFormData('primaryCrops', newCrops);
                        }}
                      />
                    }
                    label={crop}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Animal Types</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select all animals you raise on your farm
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {animalOptions.map((animal) => (
                  <FormControlLabel
                    key={animal}
                    control={
                      <Checkbox
                        checked={formData.animalTypes.includes(animal)}
                        onChange={(e) => {
                          const newAnimals = e.target.checked
                            ? [...formData.animalTypes, animal]
                            : formData.animalTypes.filter(a => a !== animal);
                          updateFormData('animalTypes', newAnimals);
                        }}
                      />
                    }
                    label={animal}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Farming Methods</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select your farming practices
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {farmingMethodOptions.map((method) => (
                  <FormControlLabel
                    key={method}
                    control={
                      <Checkbox
                        checked={formData.farmingMethods.includes(method)}
                        onChange={(e) => {
                          const newMethods = e.target.checked
                            ? [...formData.farmingMethods, method]
                            : formData.farmingMethods.filter(m => m !== method);
                          updateFormData('farmingMethods', newMethods);
                        }}
                      />
                    }
                    label={method}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Owner Profile
            </Typography>
            
            <TextField
              fullWidth
              label="Full Name *"
              value={formData.ownerName}
              onChange={(e) => updateFormData('ownerName', e.target.value)}
              placeholder="e.g., John Smith"
            />
            
            <TextField
              fullWidth
              label="Email Address *"
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => updateFormData('ownerEmail', e.target.value)}
              placeholder="e.g., john@example.com"
            />
            
            <TextField
              fullWidth
              label="Phone Number *"
              value={formData.ownerPhone}
              onChange={(e) => updateFormData('ownerPhone', e.target.value)}
              placeholder="e.g., +1-555-123-4567"
            />
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Business Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These fields are optional but help us provide better service
            </Typography>
            
            <TextField
              fullWidth
              label="Business License Number"
              value={formData.businessLicense}
              onChange={(e) => updateFormData('businessLicense', e.target.value)}
              placeholder="Optional"
            />
            
            <TextField
              fullWidth
              label="Tax ID / EIN"
              value={formData.taxId}
              onChange={(e) => updateFormData('taxId', e.target.value)}
              placeholder="Optional"
            />
            
            <TextField
              fullWidth
              label="Insurance Provider"
              value={formData.insuranceProvider}
              onChange={(e) => updateFormData('insuranceProvider', e.target.value)}
              placeholder="Optional"
            />
          </Stack>
        );

      case 4:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Account Setup
            </Typography>
            
            <Alert severity="info">
              Create your admin account. You'll use this email and password to log into the farm management portal.
            </Alert>
            
            <TextField
              fullWidth
              label="Password *"
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              placeholder="Minimum 8 characters"
            />
            
            <TextField
              fullWidth
              label="Confirm Password *"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              placeholder="Re-enter your password"
            />
            
            <Divider />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreeToTerms}
                  onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                />
              }
              label="I agree to the Terms and Conditions *"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreeToPrivacy}
                  onChange={(e) => updateFormData('agreeToPrivacy', e.target.checked)}
                />
              }
              label="I agree to the Privacy Policy *"
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper sx={{ maxWidth: 800, width: '100%', p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            Farm Registration
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Join our farm management platform and streamline your operations
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent sx={{ p: 4 }}>
            {renderStepContent()}
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <LoadingButton
              variant="contained"
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
              startIcon={<CheckCircleIcon />}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </LoadingButton>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>

        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button variant="text" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default FarmRegistration;