# Farm Management System - Backend API

Backend API for the Farm Management System built with Node.js, Express, and MySQL.

## Features

- ✅ User Authentication (Register, Login, Logout)
- ✅ JWT Token-based Authentication
- ✅ Email Verification
- ✅ Password Reset
- ✅ Refresh Token Mechanism
- ✅ Account Security (Rate Limiting, Account Lockout)
- ✅ Input Validation
- ✅ Farm Management
- ✅ User Profile Management

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` file

3. Create MySQL database:
```bash
mysql -u root -p < config/database.sql
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will run on `http://localhost:5000`

## Environment Variables

Configure these in your `.env` file:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=farm_management

# JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Farm Management <noreply@farmmanagement.com>

# Frontend
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/verify-email/:token` | Verify email | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |

### User

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |

## Request Examples

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123",
  "farmName": "Green Valley Farm",
  "farmType": "Crop Farming",
  "farmSize": 100,
  "location": "California, USA"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}
```

### Get Profile (Protected)
```bash
GET /api/users/profile
Authorization: Bearer <access_token>
```

## Database Schema

Key tables:
- `users` - User accounts
- `farms` - Farm information
- `user_sessions` - Active sessions with refresh tokens
- `login_attempts` - Login activity tracking
- `verification_tokens` - Email verification tokens
- `password_resets` - Password reset tokens
- `farm_members` - Farm membership

## Security Features

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Strong password requirements

2. **Account Protection**
   - 5 failed login attempts → 15-minute lockout
   - Email verification required
   - Session management with refresh tokens

3. **Token Security**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - HttpOnly cookies for refresh tokens

4. **Input Validation**
   - Express-validator for all inputs
   - SQL injection protection via parameterized queries

## Email Configuration

For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in `EMAIL_PASSWORD`

## Development

```bash
# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Project Structure

```
backend/
├── config/
│   ├── database.js
│   └── database.sql
├── controllers/
│   ├── authController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js
│   └── validationMiddleware.js
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── tokenUtils.js
│   └── emailUtils.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Support

For issues or questions, please create an issue in the repository.
