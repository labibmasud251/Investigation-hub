import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
  // Removed Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Description as ReportIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon // Keep for new button
  // Removed EditIcon, CloseIcon, PendingIcon, ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { investigationsAPI, reportsAPI } from '../services/api';

const InvestigatorInvestigations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingAction, setProcessingAction] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  // Removed state for dialog: statusDialogOpen, selectedInvestigation, newStatus, completionNotes, completionDate

  useEffect(() => {
    fetchInvestigatorInvestigations();
  }, [page, filter, statusFilter, tabValue]);

  const fetchInvestigatorInvestigations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new getMyInvestigations method with appropriate filters
      const params = {
        page,
        limit: 10,
        filter
      };
      
      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      // Add tab-specific filters
      if (tabValue === 1) {
        params.status = 'accepted';
      } else if (tabValue === 2) {
        params.status = 'completed';
      }
      
      const response = await investigationsAPI.getMyInvestigations(params);
      
      // Handle the API response format
      if (response.data && response.data.status === 'success') {
        setInvestigations(response.data.data);
        // If the API doesn't return total count, estimate based on current page
        setTotalPages(Math.max(1, Math.ceil(response.data.data.length / 10)));
      } else {
        setInvestigations([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch investigations');
      console.error('Error fetching investigations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInvestigatorInvestigations();
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handleViewDetails = (id) => {
    navigate(`/investigations/${id}`);
  };

  const handleSubmitReport = (id) => {
    navigate(`/investigations/${id}/submit-report`);
  };

  // Removed handleOpenStatusDialog, handleCloseStatusDialog, handleUpdateStatus

  const handleMarkAsCompleted = async (investigationId) => {
    try {
      setProcessingAction(investigationId);
      setError(null); // Clear previous errors

      // Call the API endpoint to mark as completed
      // Note: The backend controller doesn't expect a payload, just the ID
      await investigationsAPI.completeInvestigation(investigationId);

      // Refresh the list after successful update
      fetchInvestigatorInvestigations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark investigation as completed');
      console.error('Error marking investigation as completed:', err);
    } finally {
      setProcessingAction(null); // Reset processing state
    }
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
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Removed getStatusIcon function

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Investigations
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search investigations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="filter-label">Priority</InputLabel>
                <Select
                  labelId="filter-label"
                  value={filter}
                  onChange={handleFilterChange}
                  label="Priority"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="high">High Priority</MenuItem>
                  <MenuItem value="medium">Medium Priority</MenuItem>
                  <MenuItem value="low">Low Priority</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Investigations" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : investigations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No investigations found.
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {investigations.map((investigation) => (
              <Grid item xs={12} md={6} key={investigation.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {investigation.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={investigation.priority} 
                        color={getPriorityColor(investigation.priority)}
                        size="small"
                      />
                      <Chip 
                         label={investigation.status.replace('_', ' ')}
                         color={getStatusColor(investigation.status)}
                         size="small"
                         // Removed icon prop
                       />
                     </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {investigation.description.length > 150 
                        ? `${investigation.description.substring(0, 150)}...` 
                        : investigation.description}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Budget:
                        </Typography>
                        <Typography variant="body1">
                          {formatCurrency(investigation.budget)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Deadline:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(investigation.deadline)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Client:
                        </Typography>
                        <Typography variant="body1">
                          {investigation.client_first_name} {investigation.client_last_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Reports:
                        </Typography>
                        <Typography variant="body1">
                          {investigation.reports?.length || 0} reports submitted
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(investigation.id)}
                    >
                      View Details
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {investigation.status === 'pending' && (
                        <Button
                          startIcon={<CheckCircleIcon />}
                          color="success" // Changed color to success
                          onClick={() => handleMarkAsCompleted(investigation.id)}
                          disabled={processingAction === investigation.id}
                        >
                          Mark as Completed
                        </Button>
                      )}
                      {investigation.status === 'completed' && (
                        <Button
                          startIcon={<ReportIcon />}
                          color="primary"
                          onClick={() => handleSubmitReport(investigation.id)}
                          disabled={processingAction === investigation.id}
                        >
                          Submit Report
                        </Button>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}

      {/* Removed Status Update Dialog */}
    </Container>
  );
};

export default InvestigatorInvestigations;
