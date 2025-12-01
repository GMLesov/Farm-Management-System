import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Agriculture as AgricultureIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Organization {
  _id: string;
  name: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  members: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  isActive: boolean;
  createdAt: string;
}

interface Farm {
  _id: string;
  name: string;
  location?: {
    city?: string;
    state?: string;
  };
  farmType?: string[];
  isActive: boolean;
}

const OrganizationManagement: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Dialog states
  const [openOrgDialog, setOpenOrgDialog] = useState(false);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [orgForm, setOrgForm] = useState({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
  });

  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchOrgFarms(selectedOrg._id);
    }
  }, [selectedOrg]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/organizations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrganizations(response.data);
      if (response.data.length > 0 && !selectedOrg) {
        setSelectedOrg(response.data[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching organizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgFarms = async (orgId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/farms-multi/organization/${orgId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFarms(response.data);
    } catch (err: any) {
      console.error('Error fetching farms:', err);
    }
  };

  const handleCreateOrg = () => {
    setIsEditing(false);
    setOrgForm({
      name: '',
      description: '',
      contactEmail: '',
      contactPhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      },
    });
    setOpenOrgDialog(true);
  };

  const handleEditOrg = (org: Organization) => {
    setIsEditing(true);
    setOrgForm({
      name: org.name,
      description: org.description || '',
      contactEmail: org.contactEmail,
      contactPhone: org.contactPhone || '',
      address: org.address || {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      } as any,
    });
    setSelectedOrg(org);
    setOpenOrgDialog(true);
  };

  const handleSaveOrg = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `http://localhost:5000/api/organizations/${selectedOrg?._id}`
        : 'http://localhost:5000/api/organizations';

      const method = isEditing ? 'put' : 'post';

      await axios[method](url, orgForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(
        isEditing
          ? 'Organization updated successfully'
          : 'Organization created successfully'
      );
      setOpenOrgDialog(false);
      fetchOrganizations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving organization');
    }
  };

  const handleDeleteOrg = async (orgId: string) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Organization deleted successfully');
      fetchOrganizations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting organization');
    }
  };

  const handleAddMember = async () => {
    try {
      const token = localStorage.getItem('token');
      // First, find user by email
      const userResponse = await axios.get(
        `http://localhost:5000/api/workers?search=${memberEmail}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!userResponse.data || userResponse.data.length === 0) {
        setError('User not found with that email');
        return;
      }

      const userId = userResponse.data[0]._id;

      await axios.post(
        `http://localhost:5000/api/organizations/${selectedOrg?._id}/members`,
        { memberId: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Member added successfully');
      setOpenMemberDialog(false);
      setMemberEmail('');
      fetchOrganizations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error adding member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/organizations/${selectedOrg?._id}/members/${memberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Member removed successfully');
      fetchOrganizations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error removing member');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Organization Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOrg}
        >
          New Organization
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Organizations List */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Organizations
              </Typography>
              <List>
                {organizations.map((org) => (
                  <ListItem
                    key={org._id}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOrg(org);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      selected={selectedOrg?._id === org._id}
                      onClick={() => setSelectedOrg(org)}
                    >
                      <ListItemText
                        primary={org.name}
                        secondary={`${org.members.length} members`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Organization Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          {selectedOrg && (
            <Card>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                    <Tab label="Details" />
                    <Tab label="Members" />
                    <Tab label="Farms" />
                  </Tabs>
                </Box>

                {/* Details Tab */}
                {tabValue === 0 && (
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {selectedOrg.name}
                    </Typography>
                    {selectedOrg.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {selectedOrg.description}
                      </Typography>
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Contact Email
                        </Typography>
                        <Typography>{selectedOrg.contactEmail}</Typography>
                      </Grid>
                      {selectedOrg.contactPhone && (
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Contact Phone
                          </Typography>
                          <Typography>{selectedOrg.contactPhone}</Typography>
                        </Grid>
                      )}
                      {selectedOrg.address?.city && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Address
                          </Typography>
                          <Typography>
                            {selectedOrg.address.street && `${selectedOrg.address.street}, `}
                            {selectedOrg.address.city}
                            {selectedOrg.address.state && `, ${selectedOrg.address.state}`}
                            {selectedOrg.address.zipCode && ` ${selectedOrg.address.zipCode}`}
                            {selectedOrg.address.country && `, ${selectedOrg.address.country}`}
                          </Typography>
                        </Grid>
                      )}
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Owner
                        </Typography>
                        <Typography>{selectedOrg.owner.name}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={selectedOrg.isActive ? 'Active' : 'Inactive'}
                          color={selectedOrg.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Members Tab */}
                {tabValue === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Members ({selectedOrg.members.length})
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<PersonAddIcon />}
                        onClick={() => setOpenMemberDialog(true)}
                      >
                        Add Member
                      </Button>
                    </Box>
                    <List>
                      {selectedOrg.members.map((member) => (
                        <ListItem key={member._id}>
                          <ListItemText
                            primary={member.name}
                            secondary={
                              <>
                                {member.email}
                                <Chip
                                  label={member.role}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              </>
                            }
                          />
                          {member._id !== selectedOrg.owner._id && (
                            <ListItemSecondaryAction>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveMember(member._id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Farms Tab */}
                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      <AgricultureIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Farms ({farms.length})
                    </Typography>
                    <List>
                      {farms.map((farm) => (
                        <ListItem key={farm._id}>
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
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  {farm.farmType?.map((type) => (
                                    <Chip key={type} label={type} size="small" />
                                  ))}
                                </Box>
                              </>
                            }
                            secondaryTypographyProps={{
                              component: 'div',
                            }}
                          />
                        </ListItem>
                      ))}
                      {farms.length === 0 && (
                        <Typography color="text.secondary" align="center">
                          No farms in this organization
                        </Typography>
                      )}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Create/Edit Organization Dialog */}
      <Dialog open={openOrgDialog} onClose={() => setOpenOrgDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Organization' : 'Create New Organization'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Organization Name"
                fullWidth
                required
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={orgForm.description}
                onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Contact Email"
                fullWidth
                required
                type="email"
                value={orgForm.contactEmail}
                onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Contact Phone"
                fullWidth
                value={orgForm.contactPhone}
                onChange={(e) => setOrgForm({ ...orgForm, contactPhone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Address
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Street"
                fullWidth
                value={orgForm.address.street}
                onChange={(e) =>
                  setOrgForm({
                    ...orgForm,
                    address: { ...orgForm.address, street: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="City"
                fullWidth
                value={orgForm.address.city}
                onChange={(e) =>
                  setOrgForm({
                    ...orgForm,
                    address: { ...orgForm.address, city: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="State"
                fullWidth
                value={orgForm.address.state}
                onChange={(e) =>
                  setOrgForm({
                    ...orgForm,
                    address: { ...orgForm.address, state: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Zip Code"
                fullWidth
                value={orgForm.address.zipCode}
                onChange={(e) =>
                  setOrgForm({
                    ...orgForm,
                    address: { ...orgForm.address, zipCode: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Country"
                fullWidth
                value={orgForm.address.country}
                onChange={(e) =>
                  setOrgForm({
                    ...orgForm,
                    address: { ...orgForm.address, country: e.target.value },
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrgDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveOrg}>
            {isEditing ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={openMemberDialog} onClose={() => setOpenMemberDialog(false)}>
        <DialogTitle>Add Member</DialogTitle>
        <DialogContent>
          <TextField
            label="Member Email"
            fullWidth
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMemberDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMember}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationManagement;
