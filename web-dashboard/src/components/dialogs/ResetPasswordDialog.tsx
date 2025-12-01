import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  VpnKey as VpnKeyIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  workerName: string;
  workerId: string;
  onReset: (workerId: string, newPassword: string) => void;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  onClose,
  workerName,
  workerId,
  onReset,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [useDefault, setUseDefault] = useState(false);

  const defaultPassword = 'Farm@2024';

  const handleReset = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setUseDefault(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validatePassword = (): boolean => {
    const pwd = useDefault ? defaultPassword : password;

    if (!pwd) {
      setError('Password is required');
      return false;
    }

    if (pwd.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (!useDefault) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    setError('');

    if (!validatePassword()) return;

    const finalPassword = useDefault ? defaultPassword : password;
    onReset(workerId, finalPassword);
    handleClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <VpnKeyIcon color="primary" />
          <Typography variant="h6">Reset Password</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Reset password for <strong>{workerName}</strong>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Password Requirements:</strong>
            <br />• Minimum 8 characters
            <br />• Worker will be required to change password on first login
          </Typography>
        </Alert>

        <FormControlLabel
          control={
            <Checkbox
              checked={useDefault}
              onChange={(e) => {
                setUseDefault(e.target.checked);
                setError('');
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body2">
                Use default password: <strong>{defaultPassword}</strong>
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />

        {useDefault && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">
                Default password: <strong>{defaultPassword}</strong>
              </Typography>
              <IconButton
                size="small"
                onClick={() => copyToClipboard(defaultPassword)}
                title="Copy to clipboard"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Alert>
        )}

        {!useDefault && (
          <>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              sx={{ mb: 2 }}
              InputProps={{
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
              placeholder="Enter new password"
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Confirm new password"
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;
