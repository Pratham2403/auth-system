# MERN Stack Authentication System

A complete authentication system built with the MERN stack (MongoDB, Express, React, Node.js) that provides multiple authentication providers and flexible token storage options.

## Features

- **Multiple Authentication Providers**
  - Email/Password
  - Google OAuth
  - GitHub OAuth
  - LinkedIn OAuth

- **Flexible Token Storage**
  - HTTP-only Cookies
  - Local Storage
  - Session Storage

- **Security Features**
  - JWT Authentication
  - Password Encryption
  - Protected Routes
  - Role-Based Access Control

- **User Management**
  - User Registration
  - User Login
  - Profile Management
  - Password Updates
  - Account Deletion

## Project Structure

```
/mern-auth-system
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Auth/       # Authentication components
│   │   │   └── Layout/     # Layout components
│   │   ├── config/         # Configuration files
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux store and slices
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Entry point
│   └── package.json        # Frontend dependencies
├── server/                 # Express backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── index.js            # Server entry point
│   └── package.json        # Backend dependencies
└── package.json            # Root package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- OAuth credentials (for social login)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mern-auth-system.git
   cd mern-auth-system
   ```

2. Install dependencies:
   ```
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the server directory based on `.env.example`
   - Add your MongoDB URI, JWT secret, and OAuth credentials

4. Start the development servers:
   ```
   # In the root directory
   npm run dev:both
   ```

## Configuration

### OAuth Providers

To enable social login, you need to obtain credentials from the respective providers:

1. **Google OAuth**:
   - Create a project in the [Google Developer Console](https://console.developers.google.com/)
   - Set up OAuth consent screen
   - Create OAuth client ID
   - Add authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`

2. **GitHub OAuth**:
   - Register a new OAuth application in [GitHub Developer Settings](https://github.com/settings/developers)
   - Set the callback URL to: `http://localhost:5000/api/auth/github/callback`

3. **LinkedIn OAuth**:
   - Create an app in the [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
   - Set the redirect URL to: `http://localhost:5000/api/auth/linkedin/callback`

### Token Storage

The system supports three token storage methods:

1. **HTTP-only Cookies** (default): Most secure option, tokens are stored in HTTP-only cookies
2. **Local Storage**: Tokens persist across browser sessions
3. **Session Storage**: Tokens are cleared when the browser is closed

Users can select their preferred storage method during login/registration.

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
- Protected routes ensure authenticated access
- Role-based access control for admin routes

## License

This project is licensed under the MIT License - see the LICENSE file for details.