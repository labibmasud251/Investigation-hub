import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as AcceptIcon,
  Cancel as DeclineIcon,
  Description as ReportIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { investigationsAPI, reportsAPI } from '../services/api';

const InvestigationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [investigation, setInvestigation] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    content: '',
    status: 'draft',
    attachments: []
  });
  const [reportErrors, setReportErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvestigationDetails();
  }, [id]);

  const fetchInvestigationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [investigationResponse, reportsResponse] = await Promise.all([
        investigationsAPI.getInvestigation(id),
        reportsAPI.getInvestigationReports(id)
      ]);
      
      setInvestigation(investigationResponse.data.data);
      setReports(reportsResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch investigation details');
      console.error('Error fetching investigation details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvestigation = async () => {
    try {
      setLoading(true);
      await investigationsAPI.acceptInvestigation(id);
      fetchInvestigationDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept investigation');
      console.error('Error accepting investigation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineInvestigation = async () => {
    try {
      setLoading(true);
      await investigationsAPI.declineInvestigation(id);
      fetchInvestigationDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline investigation');
      console.error('Error declining investigation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReportDialog = () => {
    setReportDialogOpen(true);
  };

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
    setReportForm({
      title: '',
      content: '',
      status: 'draft',
      attachments: []
    });
    setReportErrors({});
  };

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportForm({
      ...reportForm,
      [name]: value
    });
    
    // Clear error when field is edited
    if (reportErrors[name]) {
      setReportErrors({
        ...reportErrors,
        [name]: null
      });
    }
  };

  const validateReportForm = () => {
    const errors = {};
    
    if (!reportForm.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!reportForm.content.trim()) {
      errors.content = 'Content is required';
    }
    
    if (!reportForm.status) {
      errors.status = 'Status is required';
    }
    
    setReportErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitReport = async () => {
    if (!validateReportForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      const reportData = {
        ...reportForm,
        investigationId: id
      };
      
      await reportsAPI.createReport(reportData);
      handleCloseReportDialog();
      fetchInvestigationDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
      console.error('Error submitting report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/investigations/${id}/reports/${reportId}`);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : investigation ? (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {investigation.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={investigation.priority} 
                    color={getPriorityColor(investigation.priority)}
                  />
                  <Chip 
                    label={investigation.status} 
                    color={getStatusColor(investigation.status)}
                  />
                </Box>
              </Box>
              
              {investigation.status === 'pending' && user?.roles?.includes('investigator') && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<AcceptIcon />}
                    onClick={handleAcceptInvestigation}
                    disabled={loading}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeclineIcon />}
                    onClick={handleDeclineInvestigation}
                    disabled={loading}
                  >
                    Decline
                  </Button>
                </Box>
              )}
              
              {investigation.status === 'accepted' && user?.roles?.includes('investigator') && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ReportIcon />}
                  onClick={handleOpenReportDialog}
                >
                  Submit Report
                </Button>
              )}
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {investigation.description}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Reports
                </Typography>
                
                {reports.length === 0 ? (
                  <Alert severity="info">
                    No reports have been submitted for this investigation yet.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {reports.map((report) => (
                      <Grid item xs={12} key={report._id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="h6">
                                {report.title}
                              </Typography>
                              <Chip 
                                label={report.status} 
                                color={report.status === 'draft' ? 'default' : 'primary'}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {report.content.length > 200 
                                ? `${report.content.substring(0, 200)}...` 
                                : report.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Submitted on {formatDate(report.createdAt)}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button 
                              size="small" 
                              onClick={() => handleViewReport(report._id)}
                            >
                              View Full Report
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Investigation Details
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Client
                    </Typography>
                    <Typography variant="body1">
                      {investigation.client?.first_name} {investigation.client?.last_name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Investigator
                    </Typography>
                    <Typography variant="body1">
                      {investigation.investigator 
                        ? `${investigation.investigator.first_name} ${investigation.investigator.last_name}`
                        : 'Not assigned yet'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Budget
                    </Typography>
                    <Typography variant="body1">
                      ${investigation.budget}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Deadline
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(investigation.deadline)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created On
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(investigation.createdAt)}
                    </Typography>
                  </Box>
                  
                  {investigation.completionDate && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Completed On
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(investigation.completionDate)}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </>
      ) : (
        <Alert severity="error">
          Investigation not found.
        </Alert>
      )}
      
      {/* Report Submission Dialog */}
      <Dialog 
        open={reportDialogOpen} 
        onClose={handleCloseReportDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submit Report
          <IconButton
            aria-label="close"
            onClick={handleCloseReportDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Report Title"
                name="title"
                value={reportForm.title}
                onChange={handleReportChange}
                error={!!reportErrors.title}
                helperText={reportErrors.title}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Report Content"
                name="content"
                value={reportForm.content}
                onChange={handleReportChange}
                error={!!reportErrors.content}
                helperText={reportErrors.content}
                multiline
                rows={6}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!reportErrors.status}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={reportForm.status}
                  onChange={handleReportChange}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="final">Final</MenuItem>
                </Select>
                {reportErrors.status && (
                  <FormHelperText>{reportErrors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Note: You can upload attachments in the next step.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitReport} 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvestigationDetails; 