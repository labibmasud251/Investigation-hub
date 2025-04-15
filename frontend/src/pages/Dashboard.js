import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isClient, isInvestigator } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/dashboard');
      setDashboardData(response.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewInvestigation = (id) => {
    navigate(`/investigations/${id}`);
  };

  const handleNewInvestigation = () => {
    navigate('/investigations/new');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'info';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isClient && dashboardData?.statistics?.client && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom>
                  Total Requests
                </Typography>
                <Typography component="p" variant="h4">
                  {dashboardData.statistics.client.total_requests || 0}
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    <AssignmentIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    All time
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom>
                  Submitted Requests
                </Typography>
                <Typography component="p" variant="h4">
                  {dashboardData.statistics.client.submitted_requests || 0}
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    <AssignmentIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Awaiting response
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom>
                  Pending Requests
                </Typography>
                <Typography component="p" variant="h4">
                  {dashboardData.statistics.client.pending_requests || 0}
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    <PendingIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    In progress
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom>
                  Completed Requests
                </Typography>
                <Typography component="p" variant="h4">
                  {dashboardData.statistics.client.completed_requests || 0}
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Finished
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </>
        )}

        {isInvestigator && dashboardData?.statistics?.investigator && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom>
                  Total Assignments
                </Typography>
                <Typography component="p" variant="h4">
                  {dashboardData.statistics.investigator.total_assignments || 0}
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    <AssignmentIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    All time
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom>
                  Active Assignments
                </Typography>
                <Typography component="p" variant="h4">
                  {dashboardData.statistics.investigator.active_assignments || 0}
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    <PendingIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    In progress
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom>
                  Completed Assignments
                </Typography>
                <Typography component="p" variant="h4">
                  {dashboardData.statistics.investigator.completed_assignments || 0}
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Finished
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom>
                  Average Rating
                </Typography>
                <Typography component="p" variant="h4">
                  {dashboardData.statistics.investigator.average_rating 
                    ? dashboardData.statistics.investigator.average_rating.toFixed(1) 
                    : 'N/A'}
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    <StarIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Client feedback
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      {/* Tabs for Recent Investigations and Pending Actions */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Recent Investigations" />
          <Tab label="Pending Actions" />
        </Tabs>
        
        {/* Recent Investigations Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            {isClient && dashboardData?.recentInvestigations?.client?.length > 0 ? (
              <List>
                {dashboardData.recentInvestigations.client.map((investigation) => (
                  <React.Fragment key={investigation.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={investigation.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {new Date(investigation.created_at).toLocaleDateString()}
                            </Typography>
                            {` — ${investigation.description?.substring(0, 100)}${investigation.description?.length > 100 ? '...' : ''}`}
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={investigation.status} 
                          color={getStatusColor(investigation.status)} 
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Tooltip title="View Details">
                          <IconButton 
                            edge="end" 
                            aria-label="view" 
                            onClick={() => handleViewInvestigation(investigation.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : isInvestigator && dashboardData?.recentInvestigations?.investigator?.length > 0 ? (
              <List>
                {dashboardData.recentInvestigations.investigator.map((investigation) => (
                  <React.Fragment key={investigation.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={investigation.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {new Date(investigation.created_at).toLocaleDateString()}
                            </Typography>
                            {` — ${investigation.description?.substring(0, 100)}${investigation.description?.length > 100 ? '...' : ''}`}
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={investigation.status} 
                          color={getStatusColor(investigation.status)} 
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Tooltip title="View Details">
                          <IconButton 
                            edge="end" 
                            aria-label="view" 
                            onClick={() => handleViewInvestigation(investigation.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No recent investigations found.
                </Typography>
                {isClient && (
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleNewInvestigation}
                    sx={{ mt: 2 }}
                  >
                    Create New Investigation
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}
        
        {/* Pending Actions Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            {isClient && dashboardData?.pendingActions?.client?.length > 0 ? (
              <List>
                {dashboardData.pendingActions.client.map((report) => (
                  <React.Fragment key={report.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`Report for: ${report.title}`}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {new Date(report.created_at).toLocaleDateString()}
                            </Typography>
                            {` — Please rate this investigation report.`}
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleViewInvestigation(report.investigation_request_id)}
                        >
                          Rate Report
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : isInvestigator && dashboardData?.pendingActions?.investigator?.length > 0 ? (
              <List>
                {dashboardData.pendingActions.investigator.map((investigation) => (
                  <React.Fragment key={investigation.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={investigation.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {new Date(investigation.created_at).toLocaleDateString()}
                            </Typography>
                            {` — This investigation requires your attention.`}
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleViewInvestigation(investigation.id)}
                        >
                          View Details
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No pending actions.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {isClient && (
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    New Investigation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create a new investigation request
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<AddIcon />} 
                    onClick={handleNewInvestigation}
                  >
                    Create
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )}
          
          {isInvestigator && (
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    Available Investigations
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browse available investigation requests
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/investigations')}
                  >
                    Browse
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  My Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and update your profile
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => navigate('/profile')}
                >
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Dashboard; 