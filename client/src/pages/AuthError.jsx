import React from 'react';
import { Container } from '@mui/material';
import AuthError from '../components/Auth/AuthError';

const AuthErrorPage = () => {
  return (
    <Container>
      <AuthError />
    </Container>
  );
};

export default AuthErrorPage;