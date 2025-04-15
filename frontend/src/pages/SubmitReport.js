import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { investigationsAPI, reportsAPI } from '../services/api';

const SubmitReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [investigation, setInvestigation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft',
    attachments: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    fetchInvestigationDetails();
  }, [id]);

  const fetchInvestigationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await investigationsAPI.getInvestigation(id);
      setInvestigation(response.data.data);
      
      // Check if user is the assigned investigator
      if (response.data.data.investigator?._id !== user._id) {
        setError('You are not authorized to submit reports for this investigation');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch investigation details');
      console.error('Error fetching investigation details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Update the form data with the new files
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files]
    });
    
    // Reset the file input to allow selecting the same file again
    setFileInputKey(prevKey => prevKey + 1);
  };

  const handleRemoveFile = (index) => {
    const updatedAttachments = [...formData.attachments];
    updatedAttachments.splice(index, 1);
    
    setFormData({
      ...formData,
      attachments: updatedAttachments
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Create FormData object to handle file uploads
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('content', formData.content);
      formDataObj.append('status', formData.status);
      formDataObj.append('investigationId', id);
      
      // Append each file to the FormData
      formData.attachments.forEach((file, index) => {
        formDataObj.append(`attachments`, file);
      });
      
      await reportsAPI.createReport(formDataObj);
      navigate(`/investigations/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
      console.error('Error submitting report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">
          {error}
        </Alert>
      ) : investigation ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Submit Report
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Investigation: {investigation.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={investigation.priority} 
                color={
                  investigation.priority === 'high' ? 'error' : 
                  investigation.priority === 'medium' ? 'warning' : 'success'
                }
              />
              <Chip 
                label={investigation.status} 
                color={
                  investigation.status === 'pending' ? 'warning' : 
                  investigation.status === 'accepted' ? 'info' : 
                  investigation.status === 'completed' ? 'success' : 'error'
                }
              />
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Report Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Report Content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  error={!!errors.content}
                  helperText={errors.content}
                  multiline
                  rows={8}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="final">Final</MenuItem>
                  </Select>
                  {errors.status && (
                    <FormHelperText>{errors.status}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Attachments
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-input"
                    key={fileInputKey}
                  />
                  <label htmlFor="file-input">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFileIcon />}
                    >
                      Add Attachments
                    </Button>
                  </label>
                </Box>
                
                {formData.attachments.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.attachments.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => handleRemoveFile(index)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No attachments added yet.
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      ) : (
        <Alert severity="error">
          Investigation not found.
        </Alert>
      )}
    </Container>
  );
};

export default SubmitReport; 