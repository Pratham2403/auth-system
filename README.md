# MERN Authentication System

A comprehensive authentication system built with the MERN stack (MongoDB, Express, React, Node.js) that provides multiple authentication methods, flexible token storage options, and a containerized deployment setup.

![Authentication System](https://img.shields.io/badge/Auth%20System-MERN-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

This project implements a complete authentication solution featuring multiple OAuth providers, configurable token storage, and role-based access control. The system is fully containerized using Docker for easy deployment and scalability.

## Features

- **Multiple Authentication Providers**
  - Email/Password
  - Google OAuth
  - GitHub OAuth
  - LinkedIn OAuth

- **Flexible Token Storage**
  - HTTP-only Cookies (most secure)
  - Local Storage
  - Session Storage

- **Security Features**
  - JWT Authentication
  - Password Encryption (bcrypt)
  - Protected Routes
  - Role-Based Access Control

- **User Management**
  - User Registration
  - User Login
  - Profile Management
  - Password Updates
  - Account Deletion

- **Containerization**
  - Optimized Docker images using Alpine Linux
  - Multi-stage builds for smaller footprint
  - Docker Compose for orchestration
  - Non-root user for enhanced security

## Architecture

The application follows a standard MERN architecture:

- **Frontend**: React with Redux Toolkit for state management
- **Backend**: Express.js REST API
- **Database**: MongoDB
- **Authentication**: JWT + Passport.js
- **Containerization**: Docker + Docker Compose

## OAuth Callback URLs

For OAuth authentication to work correctly, you must configure the following callback URLs in your respective provider developer consoles:

| Provider  | Callback URL                              |
|-----------|-------------------------------------------|
| Google    | `http://localhost:5000/api/auth/google/callback`    |
| GitHub    | `http://localhost:5000/api/auth/github/callback`    |
| LinkedIn  | `http://localhost:5000/api/auth/linkedin/callback`  |

When deploying to production, replace `localhost:5000` with your domain.

## Prerequisites

- Docker and Docker Compose
- OAuth credentials for Google, GitHub, and LinkedIn (for social login)

## Installation & Setup

### Using Docker

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mern-auth-system.git
   cd mern-auth-system
   ```

2. Configure environment variables:
   ```
   cp server/.env.example server/.env
   ```
   Edit the .env file to add your OAuth credentials and other configurations.

3. Build and run the containers:
   ```
   docker-compose up --build -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB Express: http://localhost:8081

### Manual Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mern-auth-system.git
   cd mern-auth-system
   ```

2. Install dependencies:
   ```
   cd server && npm install
   cd ../client && npm install
   ```

3. Configure environment variables:
   ```
   cp server/.env.example server/.env
   ```
   Edit the .env file to add your OAuth credentials and other configurations.

4. Start the development servers:
   ```
   # Terminal 1 - Start the backend
   cd server
   npm run dev
   
   # Terminal 2 - Start the frontend
   cd client
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### OAuth

- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/github` - GitHub OAuth login
- `GET /api/auth/linkedin` - LinkedIn OAuth login

### User Management

- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Update user password
- `DELETE /api/users` - Delete user account

## Security Considerations

- JWT tokens are signed with a secret key
- Passwords are hashed using bcrypt
- HTTP-only cookies prevent XSS attacks
- CORS is configured to restrict access to the API
- Docker containers run as non-root users
- Environment variables are properly secured

## Docker Optimizations

- Multi-stage builds for frontend to minimize image size
- Alpine-based images for smaller footprint
- Production dependencies only for backend
- Non-root user for enhanced security
- Named volume for database persistence

## Environment Variables

Create a .env file in the server directory with the following variables:

```
# MongoDB Connection
MONGO_URI=mongodb://db:27017/mern-auth

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Client URL
CLIENT_URL=http://localhost:3000
```

## Project Structure

```
/auth-system
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Auth/       # Authentication components
│   │   │   └── Layout/     # Layout components
│   │   ├── config/         # Configuration files
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux store and slices
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Entry point
│   ├── Dockerfile          # Frontend container configuration
│   └── package.json        # Frontend dependencies
├── server/                 # Express backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── .env                # Environment variables (create from .env.example)
│   ├── Dockerfile          # Backend container configuration
│   ├── index.js            # Server entry point
│   └── package.json        # Backend dependencies
├── docker-compose.yaml     # Container orchestration
└── README.md               # Project documentation
```

## Development

For local development without Docker:

1. Start the backend:
   ```
   cd server
   npm run dev
   ```

2. Start the frontend:
   ```
   cd client
   npm run dev
   ```

## Deployment

For production deployment:

1. Update environment variables for production in .env
2. Build and deploy containers:
   ```
   docker-compose -f docker-compose.yaml up -d
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Passport.js](http://www.passportjs.org/)
- [Docker](https://www.docker.com/)
- [Material UI](https://mui.com/)
