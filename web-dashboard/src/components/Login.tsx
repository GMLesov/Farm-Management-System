import React, { useState } from 'react';
import {
  Box,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Paper,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Agriculture as AgricultureIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import ForgotPasswordDialog from './ForgotPasswordDialog';

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleChange = (field: keyof LoginData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'rememberMe' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    setLocalError('');
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setLocalError('');

      const response = await authService.loginAdmin({
        email: formData.email,
        password: formData.password,
      });

      // Successful login, navigate to dashboard
      if (response.user.role === 'admin') {
        navigate('/', { replace: true });
      } else {
        setLocalError('Access denied. Admin credentials required.');
        authService.logout();
      }
    } catch (error: any) {
      setLocalError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordOpen(true);
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
      <Paper
        sx={{
          maxWidth: 450,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 4,
            textAlign: 'center',
          }}
        >
          <AgricultureIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Farm Manager
          </Typography>
          <Typography variant="subtitle1">
            Sign in to your farm management portal
          </Typography>
        </Box>

        {/* Login Form */}
        <CardContent sx={{ p: 4 }}>
          {localError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {localError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your email"
                variant="outlined"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your password"
                variant="outlined"
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.rememberMe}
                    onChange={handleChange('rememberMe')}
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={handleForgotPassword}
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 3, py: 1.5 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              New to Farm Manager?
            </Typography>
          </Divider>

          <Box textAlign="center">
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => navigate('/register')}
              sx={{ py: 1.5 }}
            >
              Register Your Farm
            </Button>
          </Box>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Need help?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/contact')}
                sx={{ textDecoration: 'none' }}
              >
                Contact Support
              </Link>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Are you a worker?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/worker-login')}
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                Worker Login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Paper>

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </Box>
  );
};

export default Login;