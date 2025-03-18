// {"code":"rate-limited","message":"You have hit the rate limit. Please <a class=\"__boltUpgradePlan__\">Upgrade</a> to keep chatting, or you can continue coding for free in the editor.","providerLimitHit":false,"isRetryable":true}


import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  KeyRound,
  Shield,
  Database,
  Users,
  GithubIcon,
  ScanFace,
  LinkedinIcon,
  Mail,
  Chrome
} from 'lucide-react';
import { authConfig } from '../config/authConfig';

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Features section data
  const features = [
    {
      icon: <Shield size={24} />,
      title: 'Multiple Auth Providers',
      description: 'Support for email/password, Google, GitHub, and LinkedIn authentication'
    },
    {
      icon: <Database size={24} />,
      title: 'Flexible Storage',
      description: 'Choose between HTTP-only cookies, local storage, or session storage'
    },
    {
      icon: <KeyRound size={24} />,
      title: 'Secure by Default',
      description: 'JWT authentication, password encryption, and protected routes'
    },
    {
      icon: <ScanFace size={24} />,
      title: 'Signle Sign-On',
      description: 'SSO support with OAuth2 providers and custom SAML integration'
    }
  ];

  // Auth providers section data
  const providers = [
    { icon: <Mail size={24} />, name: 'Email' },
    { icon: <Chrome size={24} />, name: 'Google' },
    { icon: <GithubIcon size={24} />, name: 'GitHub' },
    { icon: <LinkedinIcon size={24} />, name: 'LinkedIn' }
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                MERN Authentication System
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                A complete authentication solution with multiple providers and flexible token storage options
              </Typography>
              {!isAuthenticated && (
                <Stack direction="row" spacing={2}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    sx={{ bgcolor: 'white', color: 'primary.main' }}
                  >
                    Get Started
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                    sx={{ color: 'white', borderColor: 'white' }}
                  >
                    Sign In
                  </Button>
                </Stack>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Auth Providers Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
            Supported Authentication Providers
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <List>
                  {providers.map((provider, index) => (
                    <React.Fragment key={provider.name}>
                      <ListItem>
                        <ListItemIcon sx={{ color: 'primary.main' }}>
                          {provider.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={provider.name}
                          secondary={`Sign in with ${provider.name}`}
                        />
                      </ListItem>
                      {index < providers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Storage Options Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Flexible Token Storage
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Choose Your Preferred Storage Method:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Shield />
                  </ListItemIcon>
                  <ListItemText
                    primary="HTTP-only Cookies"
                    secondary="Most secure option, prevents XSS attacks"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Database />
                  </ListItemIcon>
                  <ListItemText
                    primary="Local Storage"
                    secondary="Persists across browser sessions"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Database />
                  </ListItemIcon>
                  <ListItemText
                    primary="Session Storage"
                    secondary="Cleared when the browser is closed"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;