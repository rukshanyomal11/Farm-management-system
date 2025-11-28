# Admin System Setup Guide

## Overview
The Farm Management System now includes a separate admin authentication system for system administrators with elevated privileges.

## Features

### Admin Registration
- Secure admin account creation with secret key verification
- Located at: `/admin/register`
- Requires admin secret key for registration

### Admin Login
- Separate login portal for administrators
- Located at: `/admin/login`
- Blue/purple color scheme to distinguish from user login

### Admin Dashboard
- System overview with statistics
- User management capabilities
- Located at: `/admin/dashboard`

## Setup Instructions

### 1. Update Database Schema
Run the migration SQL file to add the `super_admin` role:

```bash
# Navigate to backend directory
cd backend

# Run the migration
mysql -u root -p farm_management < config/migration_add_super_admin.sql
```

Or manually run:
```sql
USE farm_management;
ALTER TABLE users 
MODIFY COLUMN role ENUM('super_admin', 'farm_owner', 'farm_manager', 'accountant', 'field_worker') DEFAULT 'farm_owner';
```

### 2. Environment Configuration
The admin secret key is configured in `backend/.env`:
```env
ADMIN_SECRET_KEY=SUPER_ADMIN_SECRET_2024
```

**Important:** Change this to a strong, unique secret key in production!

### 3. Start the Application

#### Backend:
```bash
cd backend
npm start
```

#### Frontend:
```bash
cd fontend
npm run dev
```

## Using the Admin System

### Creating the First Admin Account

1. Navigate to: `http://localhost:5173/admin/register`

2. Fill in the registration form:
   - Full Name: Your name
   - Email: admin@example.com
   - Password: Strong password (min 8 characters)
   - Confirm Password: Same password
   - **Admin Secret Key:** `SUPER_ADMIN_SECRET_2024` (or your custom key from .env)

3. Click "Create Admin Account"

4. You'll be redirected to the admin login page

### Logging In as Admin

1. Navigate to: `http://localhost:5173/admin/login`
   - Or click "Admin Login" link from the regular login page

2. Enter your admin credentials

3. Upon successful login, you'll be redirected to the admin dashboard

### Admin Dashboard

The admin dashboard provides:
- **Statistics Overview:**
  - Total Users count
  - Active Users count
  - Recent Logins count
  - Total Farms count

- **Quick Actions:**
  - Manage Users (coming soon)
  - View Reports (coming soon)
  - System Settings (coming soon)

## API Endpoints

### Admin Authentication

#### Register Admin
```http
POST /api/admin/register
Content-Type: application/json

{
  "fullName": "Admin Name",
  "email": "admin@example.com",
  "password": "securePassword123",
  "secretKey": "SUPER_ADMIN_SECRET_2024"
}
```

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

#### Get Admin Profile
```http
GET /api/admin/profile
Authorization: Bearer <access_token>
```

#### Get All Users (Admin Only)
```http
GET /api/admin/users
Authorization: Bearer <access_token>
```

#### Update User Status (Admin Only)
```http
PATCH /api/admin/users/:userId/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "isActive": true
}
```

## Security Features

1. **Secret Key Protection:** Admin registration requires a secret key
2. **Role-Based Access:** Only `super_admin` role can access admin endpoints
3. **JWT Authentication:** Secure token-based authentication
4. **Separate Token Storage:** Admin tokens stored separately from user tokens
5. **Account Status Check:** Inactive accounts cannot login

## Color Scheme

To distinguish admin pages from user pages:
- **User Pages:** Green gradients (farm theme)
- **Admin Pages:** Blue/purple gradients (professional/tech theme)

## Accessing Admin Portal from User Login

Users can access the admin login through:
1. The "System Administrator?" link at the bottom of the regular login page
2. Direct URL: `/admin/login`

## Next Steps

Based on the `DASHBOARD_ARCHITECTURE.md`, the following features will be implemented:

1. User management interface
2. Farm oversight dashboard
3. System-wide reports and analytics
4. Role and permission management
5. Activity monitoring
6. System settings configuration

## Troubleshooting

### "Invalid admin secret key"
- Check that the secret key in the registration form matches the one in `backend/.env`

### "Admin not found" or unauthorized errors
- Ensure the database migration was run successfully
- Verify the user has `super_admin` role in the database

### Cannot access admin dashboard
- Clear browser localStorage and login again
- Check that the backend server is running on port 5000
- Verify the JWT token is being sent in the Authorization header

## Production Recommendations

1. **Change the Admin Secret Key:** Use a strong, random key
2. **Limit Admin Registration:** Consider disabling public admin registration after initial setup
3. **Use HTTPS:** Always use HTTPS in production
4. **Monitor Admin Activity:** Log all admin actions
5. **Regular Security Audits:** Review admin access logs regularly
