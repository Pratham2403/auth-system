import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { User, Mail, Calendar, Shield, Github, Linkedin, ToggleLeft as Google } from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get provider icon
  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'google':
        return <Google />;
      case 'github':
        return <Github />;
      case 'linkedin':
        return <Linkedin />;
      default:
        return <Mail />;
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Avatar
              src={user?.profilePicture || ''}
              alt={user?.name}
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {getProviderIcon(user?.provider)}
              <Typography variant="body2" sx={{ ml: 1 }}>
                Signed in with {user?.provider === 'local' ? 'Email' : user?.provider}
              </Typography>
            </Box>
            
            <Divider sx={{ width: '100%', my: 2 }} />
            
            <List sx={{ width: '100%' }}>
              <ListItem>
                <ListItemIcon>
                  <User size={20} />
                </ListItemIcon>
                <ListItemText 
                  primary="Role" 
                  secondary={user?.role || 'User'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Calendar size={20} />
                </ListItemIcon>
                <ListItemText 
                  primary="Joined" 
                  secondary={user?.createdAt ? formatDate(user.createdAt) : 'N/A'} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.name}!
            </Typography>
            <Typography variant="body1" paragraph>
              You have successfully authenticated with our MERN Authentication System.
              This dashboard demonstrates the protected routes that are only accessible
              to authenticated users.
            </Typography>
            <Typography variant="body1">
              Your account is secured with {user?.provider === 'local' ? 'email and password' : user?.provider} authentication.
            </Typography>
          </Paper>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Authentication Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Shield size={20} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Provider" 
                        secondary={user?.provider === 'local' ? 'Email' : user?.provider} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <User size={20} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="User ID" 
                        secondary={user?.id} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Storage Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Storage Type" 
                        secondary={localStorage.getItem('storageType') || 'cookie'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Session Status" 
                        secondary="Active" 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;