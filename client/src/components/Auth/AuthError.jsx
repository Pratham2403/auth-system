import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Alert } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

const AuthError = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('Authentication failed');
  
  useEffect(() => {
    // Get error message from URL query params
    const params = new URLSearchParams(location.search);
    const message = params.get('message');
    
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    }
  }, [location.search]);
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3
      }}
    >
      <ErrorOutline color="error" sx={{ fontSize: 60, mb: 3 }} />
      <Typography variant="h5" gutterBottom>
        Authentication Error
      </Typography>
      
      <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 400 }}>
        {errorMessage}
      </Alert>
      
      <Button 
        variant="contained" 
        onClick={() => navigate('/login')}
      >
        Back to Login
      </Button>
    </Box>
  );
};

export default AuthError;