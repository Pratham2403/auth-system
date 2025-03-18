import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { GitHub, Google, LinkedIn } from '@mui/icons-material';
import { authConfig } from '../../config/authConfig';

/**
 * Social Authentication Buttons Component
 * Renders buttons for enabled social authentication providers
 * 
 * @param {Object} props - Component props
 * @param {Array} props.providers - List of provider IDs to display
 * @param {string} props.storageType - Storage type for authentication token
 * @param {string} props.title - Optional title for the social auth section
 */
const SocialAuthButtons = ({ 
  providers = ['google', 'github', 'linkedin'], 
  storageType = authConfig.defaultStorage,
  title = 'Or continue with'
}) => {

  
  // Filter enabled providers from config
  const enabledProviders = authConfig.providers
    .filter(provider => 
      providers.includes(provider.id) && 
      provider.enabled && 
      provider.id !== 'email'
    );
  
  // If no enabled providers, don't render anything
  if (enabledProviders.length === 0) {
    return null;
  }
  
  // Get icon component for provider
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
  
  return (
    <Stack spacing={2} sx={{ width: '100%', mt: 2 }}>
      {title && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
          sx={{ 
            position: 'relative',
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              width: '30%',
              height: '1px',
              backgroundColor: 'divider'
            },
            '&::before': {
              left: 0
            },
            '&::after': {
              right: 0
            }
          }}
        >
          {title}
        </Typography>
      )}
      
      {enabledProviders.map(provider => (
        <Button
          key={provider.id}
          variant="outlined"
          startIcon={getProviderIcon(provider.id)}
          fullWidth
          onClick={() => {
            localStorage.setItem('storageType', storageType);
          }}
          href={`${authConfig.api.baseUrl}${authConfig.api.auth[provider.id]}?storage=${storageType}`}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            py: 1
          }}
        >
          Continue with {provider.name}
        </Button>
      ))}
    </Stack>
  );
};

export default SocialAuthButtons;