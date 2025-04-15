import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Assignment as AssignmentIcon,
  CheckCircle as AcceptIcon,
  Cancel as DeclineIcon,
  Visibility as ViewIcon,
  Description as ReportIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { investigationsAPI } from '../services/api';

const InvestigatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchInvestigations();
  }, [tabValue]);

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (tabValue === 0) {
        // Available investigations
        response = await investigationsAPI.getAvailableInvestigations();
      } else {
        // My investigations
        response = await investigationsAPI.getMyInvestigations();
      }
      
      setInvestigations(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch investigations');
      console.error('Error fetching investigations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleAcceptInvestigation = async (id) => {
    try {
      await investigationsAPI.acceptInvestigation(id);
      fetchInvestigations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept investigation');
      console.error('Error accepting investigation:', err);
    }
  };

  const handleDeclineInvestigation = async (id) => {
    try {
      await investigationsAPI.declineInvestigation(id);
      fetchInvestigations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline investigation');
      console.error('Error declining investigation:', err);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/investigations/${id}`);
  };

  const handleSubmitReport = (id) => {
    navigate(`/investigations/${id}/report`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredInvestigations = investigations.filter(investigation => {
    // Apply search filter
    const matchesSearch = investigation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investigation.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply priority filter
    const matchesPriority = filters.priority === 'all' || investigation.priority === filters.priority;
    
    // Apply status filter
    const matchesStatus = filters.status === 'all' || investigation.status === filters.status;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Investigator Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AssignmentIcon />}
            onClick={() => navigate('/investigations/new')}
          >
            Create Investigation
          </Button>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Available Investigations" />
          <Tab label="My Investigations" />
        </Tabs>

        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search investigations..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2 }}
          />
          <Tooltip title="Filter">
            <IconButton 
              color={filterOpen ? "primary" : "default"}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sort">
            <IconButton>
              <SortIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {filterOpen && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Priority</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['all', 'low', 'medium', 'high'].map((priority) => (
                    <Chip
                      key={priority}
                      label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                      onClick={() => handleFilterChange('priority', priority)}
                      color={filters.priority === priority ? 'primary' : 'default'}
                      variant={filters.priority === priority ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Status</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['all', 'pending', 'accepted', 'completed', 'cancelled'].map((status) => (
                    <Chip
                      key={status}
                      label={status.charAt(0).toUpperCase() + status.slice(1)}
                      onClick={() => handleFilterChange('status', status)}
                      color={filters.status === status ? 'primary' : 'default'}
                      variant={filters.status === status ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredInvestigations.length === 0 ? (
          <Alert severity="info">
            {tabValue === 0 
              ? 'No available investigations found.' 
              : 'You have no assigned investigations.'}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredInvestigations.map((investigation) => (
              <Grid item xs={12} sm={6} md={4} key={investigation._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" component="h2" noWrap>
                        {investigation.title}
                      </Typography>
                      <Chip 
                        label={investigation.priority} 
                        color={getPriorityColor(investigation.priority)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {investigation.description.length > 100 
                        ? `${investigation.description.substring(0, 100)}...` 
                        : investigation.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Budget: ${investigation.budget}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Deadline: {new Date(investigation.deadline).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip 
                      label={investigation.status} 
                      color={getStatusColor(investigation.status)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(investigation._id)}
                    >
                      View
                    </Button>
                    
                    {tabValue === 0 && investigation.status === 'pending' && (
                      <>
                        <Button 
                          size="small" 
                          color="success" 
                          startIcon={<AcceptIcon />}
                          onClick={() => handleAcceptInvestigation(investigation._id)}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeclineIcon />}
                          onClick={() => handleDeclineInvestigation(investigation._id)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    
                    {tabValue === 1 && investigation.status === 'accepted' && (
                      <Button 
                        size="small" 
                        color="primary" 
                        startIcon={<ReportIcon />}
                        onClick={() => handleSubmitReport(investigation._id)}
                      >
                        Submit Report
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default InvestigatorDashboard; 