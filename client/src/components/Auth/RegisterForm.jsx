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
  Select
} from '@mui/material';
import { register, clearError } from '../../redux/slices/authSlice';
import { authConfig } from '../../config/authConfig';
import SocialAuthButtons from './SocialAuthButtons';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    storageType: localStorage.getItem('storageType') || authConfig.defaultStorage
  });
  
  const [passwordError, setPasswordError] = useState('');
  
  const { name, email, password, confirmPassword, agreeTerms, storageType } = formData;
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeTerms' ? checked : value
    });
    
    if (error) {
      dispatch(clearError());
    }
    
    // Clear password error when user types
    if ((name === 'password' || name === 'confirmPassword') && passwordError) {
      setPasswordError('');
    }
  };
  
  const validateForm = () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    // Check password strength
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    
    // Check terms agreement
    if (!agreeTerms) {
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Save storage preference
    localStorage.setItem('storageType', storageType);
    
    const result = await dispatch(register({
      name,
      email,
      password,
      storageType
    }));
    
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    }
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
        Create an account
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Full Name"
          name="name"
          autoComplete="name"
          autoFocus
          value={name}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
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
          autoComplete="new-password"
          value={password}
          onChange={handleChange}
          error={!!passwordError}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={handleChange}
          error={!!passwordError}
          helperText={passwordError}
        />
        
        <Grid container sx={{ mt: 2 }}>
          <Grid item xs>
            <FormControlLabel
              control={
                <Checkbox
                  name="agreeTerms"
                  color="primary"
                  checked={agreeTerms}
                  onChange={handleChange}
                  required
                />
              }
              label="I agree to the terms and conditions"
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
          disabled={loading || !agreeTerms}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign Up'}
        </Button>
        
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
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

export default RegisterForm;