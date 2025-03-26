/**
 * Authentication Configuration
 * This file contains the configuration for the authentication system
 */

export const authConfig = {
  // Available authentication providers
  providers: [
    {
      id: 'google',
      name: 'Google',
      enabled: true,
      icon: 'google'
    },
    {
      id: 'github',
      name: 'GitHub',
      enabled: true,
      icon: 'github'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      enabled: true,
      icon: 'linkedin'
    },
    {
      id: 'email',
      name: 'Email',
      enabled: true,
      icon: 'mail'
    }
  ],
  
  // Default storage type for tokens
  // Options: 'cookie', 'local', 'session'
  defaultStorage: 'local',
  
  // API endpoints
  api: {
    baseUrl: 'http://localhost:5002/api',
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
      me: '/auth/me',
      google: '/auth/google',
      github: '/auth/github',
      linkedin: '/auth/linkedin'
    },
    user: {
      profile: '/users/profile',
      password: '/users/password',
      delete: '/users'
    }
  },
  
  // Security settings
  security: {
    // Enable/disable Single Sign-On
    sso: true,
    
    // JWT settings
    jwt: {
      enabled: true
    },
    
    // Cookie settings
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  }
};