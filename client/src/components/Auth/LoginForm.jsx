import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Divider
} from '@mui/material';
import { login, clearError } from '../../redux/slices/authSlice';
import { authConfig } from '../../config/authConfig';
import SocialAuthButtons from './SocialAuthButtons';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    storageType: localStorage.getItem('storageType') || authConfig.defaultStorage
  });
  
  const { email, password, rememberMe, storageType } = formData;
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value
    });
    
    if (error) {
      dispatch(clearError());
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Determine storage type based on remember me
    const selectedStorageType = rememberMe ? 'local' : storageType;
    
    // Save storage preference
    localStorage.setItem('storageType', selectedStorageType);
    
    const result = await dispatch(login({
      email,
      password,
      storageType: selectedStorageType
    }));
    
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    }
  };

  const handleSSOLogin = () => {
    navigate('/sso');
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        mx: 'auto',
        p: 2
      }}
    >
      <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
        Sign in to your account
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* SSO Button - only show if SSO is enabled in config */}
      {authConfig.security.sso && (
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          sx={{ mb: 2 }}
          onClick={handleSSOLogin}
        >
          Sign in with SSO
        </Button>
      )}
      
      {/* Email/Password Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={handleChange}
        />
        
        <Grid container sx={{ mt: 2 }}>
          <Grid item xs>
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  color="primary"
                  checked={rememberMe}
                  onChange={handleChange}
                />
              }
              label="Remember me"
            />
          </Grid>
          <Grid item>
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="storage-type-label">Storage</InputLabel>
              <Select
                labelId="storage-type-label"
                id="storageType"
                name="storageType"
                value={storageType}
                label="Storage"
                onChange={handleChange}
              >
                <MenuItem value="cookie">Cookie</MenuItem>
                <MenuItem value="local">Local Storage</MenuItem>
                <MenuItem value="session">Session Storage</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
        
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link component={RouterLink} to="/register" variant="body2">
              Don't have an account? Sign up
            </Link>
          </Grid>
        </Grid>
      </Box>
      
      <SocialAuthButtons 
        providers={['google', 'github', 'linkedin']}
        storageType={storageType}
      />
    </Box>
  );
};

export default LoginForm;