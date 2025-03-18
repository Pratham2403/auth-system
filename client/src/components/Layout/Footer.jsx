import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Lock as LockOpen } from 'lucide-react';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800]
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockOpen sx={{ mr: 1 }} />
              <Typography variant="h6" color="text.primary">
                MERN Auth
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              A complete authentication system with multiple providers and storage options.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/login" color="inherit" display="block" sx={{ mb: 1 }}>
              Login
            </Link>
            <Link component={RouterLink} to="/register" color="inherit" display="block">
              Register
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link component={RouterLink} to="/privacy" color="inherit" display="block" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms" color="inherit" display="block">
              Terms of Service
            </Link>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} MERN Auth System. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;