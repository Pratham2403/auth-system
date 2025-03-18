import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
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
        <ShieldAlert size={80} color="#f44336" style={{ marginBottom: '1rem' }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom>
          You don't have permission to access this page
        </Typography>
        <Typography variant="body1" paragraph>
          Please contact your administrator if you believe this is an error.
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

export default Unauthorized;