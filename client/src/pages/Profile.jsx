import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { 
  updateProfile, 
  updatePassword, 
  deleteAccount,
  clearSuccess,
  clearError
} from '../redux/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error, success, message } = useSelector((state) => state.auth);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password validation error
  const [passwordError, setPasswordError] = useState('');
  
  // Delete account dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear password error when typing
    if (passwordError) {
      setPasswordError('');
    }
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await dispatch(updateProfile(profileData));
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    await dispatch(updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }));
    
    // Reset form on success
    if (!error) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };
  
  // Handle delete account
  const handleDeleteAccount = async () => {
    await dispatch(deleteAccount());
    setDeleteDialogOpen(false);
  };
  
  // Handle close success message
  const handleCloseSuccess = () => {
    dispatch(clearSuccess());
  };
  
  // Handle close error message
  const handleCloseError = () => {
    dispatch(clearError());
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>
      
      {/* Success message */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
      
      {/* Error message */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handleProfileUpdate}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    Update Profile
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Password Update */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {user?.provider !== 'local' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Password change is not available for {user?.provider} accounts.
              </Alert>
            )}
            
            <Box component="form" onSubmit={handlePasswordUpdate}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={user?.provider !== 'local'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={user?.provider !== 'local'}
                    error={!!passwordError}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={user?.provider !== 'local'}
                    error={!!passwordError}
                    helperText={passwordError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || user?.provider !== 'local'}
                  >
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Delete Account */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Danger Zone
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Once you delete your account, there is no going back. Please be certain.
            </Typography>
            
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
            
            {/* Delete Account Confirmation Dialog */}
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
            >
              <DialogTitle>Delete Account</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleDeleteAccount} color="error">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;