import React from 'react';
import { Container, Paper, Box } from '@mui/material';
import LoginForm from '../components/Auth/LoginForm';

const Login = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LoginForm />
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;