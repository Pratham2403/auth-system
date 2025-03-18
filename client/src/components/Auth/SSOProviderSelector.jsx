import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider, 
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GitHub, Google, LinkedIn } from '@mui/icons-material';
import { authConfig } from '../../config/authConfig';

const SSOProviderSelector = ({ redirectUrl = '/dashboard', storageType = 'cookie' }) => {
  const navigate = useNavigate();
  
  // Store the redirect URL for after successful authentication
  const handleProviderSelect = (providerUrl) => {
    // Save redirect URL to sessionStorage
    sessionStorage.setItem('ssoRedirectUrl', redirectUrl);
    
    // Store storage type preference
    localStorage.setItem('storageType', storageType);
    
    // Redirect to provider authentication URL
    window.location.href = `${authConfig.api.baseUrl}${providerUrl}?storage=${storageType}`;
  };
  
  // Get provider icon component
  const getProviderIcon = (providerId) => {
    switch (providerId) {
      case 'google':
        return <Google />;
      case 'github':
        return <GitHub />;
      case 'linkedin':
        return <LinkedIn />;
      default:
        return null;
    }
  };
  
  // Filter enabled providers (excluding email)
  const enabledProviders = authConfig.providers.filter(
    provider => provider.enabled && provider.id !== 'email'
  );

  if (!authConfig.security.sso || enabledProviders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', my: 2 }}>
        <Typography color="text.secondary">
          SSO is currently disabled
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Divider sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Sign in with SSO
        </Typography>
      </Divider>
      
      <Grid container spacing={2}>
        {enabledProviders.map(provider => (
          <Grid item xs={12} key={provider.id}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={getProviderIcon(provider.id)}
              onClick={() => handleProviderSelect(authConfig.api.auth[provider.id])}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1 }}
            >
              Continue with {provider.name}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SSOProviderSelector;