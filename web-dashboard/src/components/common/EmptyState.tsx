import React from 'react';
import { Box, Typography, Button, alpha } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface EmptyStateProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  sx?: SxProps<Theme>;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, sx }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
              theme.palette.primary.light,
              0.05
            )} 100%)`,
          mb: 3,
          '& svg': {
            fontSize: '3.5rem',
            color: 'primary.main',
            opacity: 0.8,
          },
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          maxWidth: 420,
          mb: action ? 3 : 0,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>
      {action && (
        <Button
          variant="contained"
          size="large"
          onClick={action.onClick}
          sx={{
            px: 4,
            py: 1.5,
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
