import React from 'react';
import { Container, Paper, Box } from '@mui/material';
import RegisterForm from '../components/Auth/RegisterForm';

const Register = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RegisterForm />
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;