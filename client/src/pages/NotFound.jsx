import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          py: 4
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;