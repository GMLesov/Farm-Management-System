import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Agriculture as AgricultureIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Farm {
  _id: string;
  name: string;
  organization: {
    _id: string;
    name: string;
  };
  location?: {
    city?: string;
    state?: string;
  };
  farmType?: string[];
}

interface FarmSwitcherProps {
  onFarmChange?: (farmId: string) => void;
}

const FarmSwitcher: React.FC<FarmSwitcherProps> = ({ onFarmChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/farms-multi', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFarms(response.data);

      // Get current farm from localStorage or set first farm as default
      const savedFarmId = localStorage.getItem('currentFarmId');
      if (savedFarmId) {
        const farm = response.data.find((f: Farm) => f._id === savedFarmId);
        setCurrentFarm(farm || response.data[0] || null);
      } else if (response.data.length > 0) {
        setCurrentFarm(response.data[0]);
        localStorage.setItem('currentFarmId', response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFarmSelect = (farm: Farm) => {
    setCurrentFarm(farm);
    localStorage.setItem('currentFarmId', farm._id);
    handleClose();

    // Trigger callback if provided
    if (onFarmChange) {
      onFarmChange(farm._id);
    }

    // Reload the page to refresh all data for the new farm
    window.location.reload();
  };

  // Group farms by organization
  const farmsByOrg = farms.reduce((acc, farm) => {
    const orgId = farm.organization._id;
    if (!acc[orgId]) {
      acc[orgId] = {
        orgName: farm.organization.name,
        farms: [],
      };
    }
    acc[orgId].farms.push(farm);
    return acc;
  }, {} as Record<string, { orgName: string; farms: Farm[] }>);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Loading farms...
        </Typography>
      </Box>
    );
  }

  if (farms.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<AgricultureIcon />}
          label="No Farms"
          size="small"
          variant="outlined"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        onClick={handleClick}
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgricultureIcon fontSize="small" />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" fontWeight={600}>
              {currentFarm?.name || 'Select Farm'}
            </Typography>
            {currentFarm?.location?.city && (
              <Typography variant="caption" color="text.secondary">
                {currentFarm.location.city}
                {currentFarm.location.state && `, ${currentFarm.location.state}`}
              </Typography>
            )}
          </Box>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            minWidth: 300,
            mt: 1,
          },
        }}
      >
        {Object.entries(farmsByOrg).map(([orgId, { orgName, farms }], index) => (
          <React.Fragment key={orgId}>
            {index > 0 && <Divider />}
            
            {/* Organization Header */}
            <MenuItem disabled sx={{ opacity: 1, py: 1 }}>
              <ListItemIcon>
                <BusinessIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={orgName}
                primaryTypographyProps={{
                  variant: 'subtitle2',
                  fontWeight: 600,
                  color: 'primary',
                }}
              />
            </MenuItem>

            {/* Farms in this organization */}
            {farms.map((farm) => (
              <MenuItem
                key={farm._id}
                onClick={() => handleFarmSelect(farm)}
                selected={currentFarm?._id === farm._id}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  {currentFarm?._id === farm._id ? (
                    <CheckCircleIcon fontSize="small" color="success" />
                  ) : (
                    <AgricultureIcon fontSize="small" color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={farm.name}
                  secondary={
                    <>
                      {farm.location?.city && (
                        <Typography variant="caption" component="span">
                          {farm.location.city}
                          {farm.location.state && `, ${farm.location.state}`}
                        </Typography>
                      )}
                      {farm.farmType && farm.farmType.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          {farm.farmType.slice(0, 2).map((type) => (
                            <Chip
                              key={type}
                              label={type}
                              size="small"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          ))}
                          {farm.farmType.length > 2 && (
                            <Chip
                              label={`+${farm.farmType.length - 2}`}
                              size="small"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          )}
                        </Box>
                      )}
                    </>
                  }
                  secondaryTypographyProps={{
                    component: 'div',
                  }}
                />
              </MenuItem>
            ))}
          </React.Fragment>
        ))}
      </Menu>
    </Box>
  );
};

export default FarmSwitcher;
