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
  FilterList as FilterIcon // Keep FilterIcon for potential future use, but remove dropdown for now
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { investigationsAPI } from '../services/api';

// Renaming component for clarity, although file name remains the same for now
const MySubmittedInvestigations = () => { 
  const navigate = useNavigate();
  const { user } = useAuth();
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // const [filter, setFilter] = useState('all'); // Removed filter state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [processingAction, setProcessingAction] = useState(null); // Removed processingAction state

  useEffect(() => {
    // Fetch investigations when page or searchTerm changes (if search is implemented on backend)
    fetchMySubmittedInvestigations(); 
  }, [page, searchTerm]); // Update dependency array

  const fetchMySubmittedInvestigations = async () => { // Renamed function
    try {
      setLoading(true);
      setError(null);
      
      // Fetch investigations submitted by the current user
      // Assuming the API can filter by clientId or a dedicated endpoint exists
      const response = await investigationsAPI.getAll({ 
        clientId: user.id, // Filter by current user's ID
        // status: 'submitted', // Optionally filter by status if needed
        page,
        limit: 10,
        search: searchTerm // Pass search term to API if backend supports it
      });
      
      // Handle the API response format (assuming similar structure)
      if (response.data && response.data.status === 'success') {
        setInvestigations(response.data.data);
        // If the API doesn't return total count, estimate based on current page
        // Use total count from API if available, otherwise estimate
        setTotalPages(response.data.totalPages || Math.max(1, Math.ceil(response.data.data.length / 10))); 
      } else {
        setInvestigations([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your submitted investigations');
      console.error('Error fetching submitted investigations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Optional: Fetch on type, or wait for submit/blur if preferred
    // setPage(1); // Reset page on new search
    // fetchMySubmittedInvestigations(); 
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMySubmittedInvestigations();
  };

  // Removed handleFilterChange function

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Removed handleAcceptInvestigation function
  // Removed handleDeclineInvestigation function

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
        My Submitted Investigations 
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Keep Search Bar */}
          <Grid item xs={12} md={8}> 
            <form onSubmit={handleSearchSubmit}> 
              <TextField
                fullWidth
                placeholder="Search your investigations..." // Updated placeholder
                value={searchTerm}
                onChange={handleSearchChange} // Use new handler
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
          {/* Removed Filter Dropdown Grid item */}
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : investigations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            You have not submitted any investigations yet, or none match your search.
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
                        // Determine color based on status (e.g., submitted, accepted, in_progress, completed, declined)
                        color={ getStatusColor(investigation.status) } // Need to implement getStatusColor
                        size="small"
                      />
                       <Chip 
                        label={`Priority: ${investigation.priority}`} 
                        color={getPriorityColor(investigation.priority)} // Use existing priority color logic
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
                  
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    {/* Add View Details Button */}
                    <Button
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(investigation.id)}
                      variant="outlined" // Or contained
                      size="small"
                    >
                      View Details
                    </Button>
                    {/* Add other client-specific actions here if needed (e.g., Edit, Cancel) */}
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
}; // End of MySubmittedInvestigations component

// Helper function for status color (moved outside the component)
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'submitted': return 'info';
    case 'accepted': return 'secondary';
    case 'in_progress': return 'primary';
    case 'completed': return 'success';
    case 'declined': return 'error';
    default: return 'default';
  }
};

export default MySubmittedInvestigations; // Export statement moved outside the component
