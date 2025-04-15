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
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as AcceptIcon,
  Cancel as DeclineIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { investigationsAPI } from '../services/api';

const InvestigationRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    fetchInvestigationRequests();
  }, [page, filter]);

  const fetchInvestigationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch pending investigations that are available for investigators
      const response = await investigationsAPI.getAll({
        status: 'submitted', // Changed from 'pending' to 'submitted' to match API response
        page,
        limit: 10,
        filter
      });
      
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
      setError(err.response?.data?.message || 'Failed to fetch investigation requests');
      console.error('Error fetching investigation requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInvestigationRequests();
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleAcceptInvestigation = async (id) => {
    try {
      setProcessingAction(id);
      
      // Create the payload according to the schema format
      const acceptPayload = {
        status: 'accepted',
        notes: 'Investigation accepted by investigator',
        completionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };
      
      await investigationsAPI.accept(id, acceptPayload);
      fetchInvestigationRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept investigation');
      console.error('Error accepting investigation:', err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDeclineInvestigation = async (id) => {
    try {
      setProcessingAction(id);
      await investigationsAPI.decline(id);
      fetchInvestigationRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline investigation');
      console.error('Error declining investigation:', err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/investigations/${id}`);
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
        Investigation Requests
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="filter-label">Filter</InputLabel>
                <Select
                  labelId="filter-label"
                  value={filter}
                  onChange={handleFilterChange}
                  label="Filter"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Requests</MenuItem>
                  <MenuItem value="high">High Priority</MenuItem>
                  <MenuItem value="medium">Medium Priority</MenuItem>
                  <MenuItem value="low">Low Priority</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : investigations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No investigation requests found.
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
                        label={investigation.status} 
                        color="warning"
                        size="small"
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
                          Posted by:
                        </Typography>
                        <Typography variant="body1">
                          {investigation.client_first_name} {investigation.client_last_name}
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
                    <Box>
                      <Button
                        startIcon={<AcceptIcon />}
                        color="success"
                        onClick={() => handleAcceptInvestigation(investigation.id)}
                        disabled={processingAction === investigation.id}
                      >
                        Accept
                      </Button>
                      <Button
                        startIcon={<DeclineIcon />}
                        color="error"
                        onClick={() => handleDeclineInvestigation(investigation.id)}
                        disabled={processingAction === investigation.id}
                      >
                        Decline
                      </Button>
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
    </Container>
  );
};

export default InvestigationRequests; 