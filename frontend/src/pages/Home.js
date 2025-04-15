import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Investigation Hub
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Your centralized platform for managing investigations
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 