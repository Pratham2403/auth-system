import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SSOProviderSelector from '../components/Auth/SSOProviderSelector';

const SSO = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  const [error, setError] = useState(null);
  
  // Get redirect URL from query parameters or use default
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  
  // Check if the app name is specified
  const appName = searchParams.get('app') || 'External Application';
  
  // Get storage type preference
  const storageType = localStorage.getItem('storageType') || 'cookie';
  
  useEffect(() => {
    // If user is already authenticated, redirect to the target URL
    if (isAuthenticated) {
      navigate(redirectUrl);
    }
    
    // Check for error in URL params (e.g., from failed OAuth callback)
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [isAuthenticated, navigate, redirectUrl, searchParams]);
  
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Single Sign-On
          </Typography>
          
          <Typography component="p" variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Sign in to access <strong>{appName}</strong>
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <CircularProgress sx={{ my: 4 }} />
          ) : (
            <SSOProviderSelector 
              redirectUrl={redirectUrl}
              storageType={storageType}
            />
          )}
          
          <Button 
            variant="text" 
            sx={{ mt: 3 }}
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SSO;