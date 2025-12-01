import React, { useState } from 'react';
import {
  Box,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Agriculture as AgricultureIcon,
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface WorkerLoginData {
  username: string;
  password: string;
}

const WorkerLogin: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<WorkerLoginData>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof WorkerLoginData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password.');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const resp = await apiService.post('/auth/worker-login', {
        username: formData.username,
        password: formData.password,
      });

      const token = (resp as any)?.data?.token || (resp as any)?.token;
      const user = (resp as any)?.data?.user || (resp as any)?.user;

      if (!token) {
        throw new Error('Invalid response from server');
      }

      apiService.setAuthToken(token);
      
      if (user) {
        try {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userType', 'worker');
        } catch {}
      }

      // Navigate to worker mobile dashboard
      navigate('/worker-mobile', { replace: true });
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
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
            bgcolor: 'success.main',
            color: 'white',
            p: 4,
            textAlign: 'center',
          }}
        >
          <AgricultureIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Worker Portal
          </Typography>
          <Typography variant="subtitle1">
            Sign in to access your tasks
          </Typography>
        </Box>

        {/* Login Form */}
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleChange('username')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your username"
                variant="outlined"
                autoComplete="username"
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
                autoComplete="current-password"
              />
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Forgot your password?</strong> Contact your farm administrator to reset it.
              </Typography>
            </Alert>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              color="success"
              disabled={loading}
              sx={{ mb: 3, py: 1.5 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Are you an administrator?{' '}
              <MuiLink
                component="button"
                type="button"
                onClick={() => navigate('/login')}
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                Admin Login
              </MuiLink>
            </Typography>
          </Box>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              Need help?{' '}
              <MuiLink
                component="button"
                type="button"
                onClick={() => navigate('/contact')}
                sx={{ textDecoration: 'none' }}
              >
                Contact Support
              </MuiLink>
            </Typography>
          </Box>
        </CardContent>
      </Paper>
    </Box>
  );
};

export default WorkerLogin;
