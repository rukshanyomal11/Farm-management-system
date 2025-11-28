# Farm Management System - Dashboard Architecture

## User Roles & Access Levels

### 1. **Super Admin** (System Administrator)
**Highest level access - Full system control**

#### Features & Permissions:
- **User Management**
  - Create, view, edit, delete all user accounts
  - Assign and modify user roles
  - Suspend/activate user accounts
  - View user activity logs
  - Reset user passwords

- **Farm Management**
  - View all farms across the system
  - Approve/reject new farm registrations
  - Monitor farm activities
  - Generate system-wide reports

- **System Settings**
  - Configure system parameters
  - Manage email templates
  - Set up notification rules
  - Database backup and restore
  - View system logs and analytics

- **Analytics & Reports**
  - System-wide dashboard metrics
  - User engagement statistics
  - Revenue/subscription reports
  - Performance monitoring

- **Support Management**
  - Handle user support tickets
  - Send system announcements
  - Manage FAQs and help content

---

### 2. **Farm Owner** (Primary User)
**Full control over their own farm**

#### Features & Permissions:
- **Farm Profile Management**
  - Edit farm details (name, location, size, type)
  - Upload farm photos and documents
  - Set farm preferences

- **Staff Management**
  - Invite and manage farm workers
  - Assign roles (Manager, Worker, Viewer)
  - Set permissions for staff members
  - Track staff attendance

- **Crop Management**
  - Add/edit/delete crop records
  - Track planting and harvest dates
  - Monitor crop health status
  - Record crop yields
  - Manage crop expenses
  - Set up crop rotation plans

- **Livestock Management**
  - Add/edit/delete animal records
  - Track breeding cycles
  - Monitor health and vaccinations
  - Record milk/egg production
  - Manage feeding schedules
  - Track animal sales and purchases

- **Inventory Management**
  - Seeds and fertilizers stock
  - Feed and supplements
  - Tools and equipment
  - Set low-stock alerts
  - Track inventory movements

- **Financial Management**
  - Record income and expenses
  - Generate profit/loss reports
  - Track sales and purchases
  - Budget planning
  - Export financial reports

- **Task Management**
  - Create and assign tasks
  - Set deadlines and priorities
  - Track task completion
  - View team calendar

- **Weather & Alerts**
  - View weather forecasts
  - Receive weather alerts
  - Plan activities based on weather

- **Reports & Analytics**
  - Farm performance dashboard
  - Crop yield reports
  - Livestock productivity
  - Financial summaries
  - Custom report generation

---

### 3. **Farm Manager** (Assigned by Owner)
**Day-to-day operations management**

#### Features & Permissions:
- **Staff Coordination**
  - Assign daily tasks to workers
  - Monitor task completion
  - Record staff attendance
  - View staff performance

- **Crop Operations**
  - Update crop records
  - Schedule farming activities
  - Monitor crop health
  - Record daily observations

- **Livestock Operations**
  - Update animal health records
  - Schedule feeding and care
  - Record daily production
  - Monitor animal welfare

- **Inventory Updates**
  - Record inventory usage
  - Request inventory purchases
  - Update stock levels

- **Task Management**
  - Create and manage tasks
  - Track progress
  - Report issues to owner

- **Basic Reports**
  - Daily activity reports
  - Weekly summaries
  - Task completion rates

#### Restrictions:
- ❌ Cannot edit farm profile
- ❌ Cannot add/remove staff members
- ❌ Cannot delete major records
- ❌ Limited financial access
- ❌ Cannot change system settings

---

### 4. **Farm Worker** (Field Staff)
**Basic operational access**

#### Features & Permissions:
- **Task Management**
  - View assigned tasks
  - Mark tasks as complete
  - Add task notes and photos
  - View task history

- **Time Tracking**
  - Clock in/out
  - View own attendance
  - Request leave

- **Basic Record Updates**
  - Record crop observations
  - Update livestock feeding
  - Report equipment issues
  - Submit daily work reports

- **View-Only Access**
  - View crop information
  - View livestock details
  - View farm calendar
  - View weather information

#### Restrictions:
- ❌ Cannot create new records
- ❌ Cannot delete any records
- ❌ Cannot view financial data
- ❌ Cannot access staff management
- ❌ Cannot assign tasks
- ❌ Limited to assigned areas only

---

### 5. **Viewer/Consultant** (External Access)
**Read-only access for advisors, consultants**

#### Features & Permissions:
- **View Access**
  - View farm overview
  - View crop records
  - View livestock data
  - View reports and analytics
  - Access farm calendar

- **Advisory Features**
  - Add comments and suggestions
  - Generate recommendation reports
  - View historical data
  - Access analytics dashboard

#### Restrictions:
- ❌ Cannot edit any records
- ❌ Cannot delete anything
- ❌ Cannot view financial details
- ❌ Cannot access staff information
- ❌ Cannot manage inventory
- ❌ Read-only access only

---

## Dashboard Layouts by Role

### Super Admin Dashboard
```
┌─────────────────────────────────────────────────┐
│ 📊 SYSTEM OVERVIEW                              │
├─────────────────────────────────────────────────┤
│ Total Users: 250 | Active Farms: 45            │
│ New Registrations (Week): 12                   │
│ Active Sessions: 87                            │
├─────────────────────────────────────────────────┤
│ 👥 Users  | 🏠 Farms | ⚙️ Settings | 📈 Reports│
└─────────────────────────────────────────────────┘
```

### Farm Owner Dashboard
```
┌─────────────────────────────────────────────────┐
│ 🏡 GREEN VALLEY FARM                            │
├─────────────────────────────────────────────────┤
│ 🌾 Crops: 8 Active | 🐄 Livestock: 45 Animals │
│ 📦 Inventory Alerts: 3 | 📋 Tasks Due: 7      │
│ 💰 This Month Revenue: $12,500                 │
├─────────────────────────────────────────────────┤
│ 🌱 Crops | 🐮 Livestock | 📦 Inventory | 👥 Staff│
│ 💵 Finance | 📋 Tasks | 📊 Reports | ⚙️ Settings│
└─────────────────────────────────────────────────┘
```

### Farm Manager Dashboard
```
┌─────────────────────────────────────────────────┐
│ 👨‍🌾 MANAGER VIEW - GREEN VALLEY FARM            │
├─────────────────────────────────────────────────┤
│ Today's Tasks: 12 | Completed: 7 | Pending: 5 │
│ Staff Present: 8/10 | Weather: ☀️ Sunny       │
├─────────────────────────────────────────────────┤
│ 📋 Tasks | 🌱 Crops | 🐮 Livestock | 📦 Inventory│
│ 👥 Team | 📊 Reports                           │
└─────────────────────────────────────────────────┘
```

### Farm Worker Dashboard
```
┌─────────────────────────────────────────────────┐
│ 👷 WORKER VIEW                                  │
├─────────────────────────────────────────────────┤
│ ⏰ Clocked In: 8:30 AM                         │
│ My Tasks Today: 5 | Completed: 2              │
├─────────────────────────────────────────────────┤
│ 📋 My Tasks | ⏰ Attendance | 📝 Reports        │
└─────────────────────────────────────────────────┘
```

---

## Database Schema for Roles

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'farm_owner', 'farm_manager', 'farm_worker', 'viewer') NOT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE
);
```

### Farm Members Table (Links users to farms)
```sql
CREATE TABLE farm_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farm_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'manager', 'worker', 'viewer') NOT NULL,
  permissions JSON, -- Custom permissions per user
  joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive') DEFAULT 'active',
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_farm_member (farm_id, user_id)
);
```

### Permissions Table
```sql
CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL, -- crops, livestock, finance, etc.
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  custom_permissions JSON
);
```

---

## Feature Modules

### Module 1: Crop Management
**Tables Needed:**
- `crops` - Crop master data
- `crop_varieties` - Different varieties
- `crop_seasons` - Planting seasons
- `crop_activities` - Daily activities
- `crop_expenses` - Costs tracking
- `crop_yields` - Harvest records

**Access Levels:**
- Owner: Full CRUD
- Manager: Create, Edit, View
- Worker: View, Add observations
- Viewer: View only

---

### Module 2: Livestock Management
**Tables Needed:**
- `livestock` - Animal records
- `livestock_breeds` - Breed information
- `health_records` - Vaccinations, treatments
- `breeding_records` - Breeding history
- `production_records` - Milk, eggs, etc.
- `feeding_schedules` - Feed management

**Access Levels:**
- Owner: Full CRUD
- Manager: Create, Edit, View
- Worker: View, Update production
- Viewer: View only

---

### Module 3: Inventory Management
**Tables Needed:**
- `inventory_items` - Item master
- `inventory_categories` - Categories
- `inventory_transactions` - Stock movements
- `inventory_alerts` - Low stock alerts
- `suppliers` - Supplier information
- `purchase_orders` - Orders

**Access Levels:**
- Owner: Full CRUD, Purchase approvals
- Manager: Create requests, Update stock
- Worker: View, Record usage
- Viewer: View only

---

### Module 4: Financial Management
**Tables Needed:**
- `transactions` - Income/Expenses
- `transaction_categories` - Categories
- `budgets` - Budget plans
- `invoices` - Sales invoices
- `payment_methods` - Payment types

**Access Levels:**
- Owner: Full access
- Manager: View reports, Limited entry
- Worker: ❌ No access
- Viewer: ❌ No access

---

### Module 5: Task Management
**Tables Needed:**
- `tasks` - Task records
- `task_assignments` - Assigned users
- `task_comments` - Comments/notes
- `task_attachments` - Photos/files
- `task_categories` - Task types

**Access Levels:**
- Owner: Full CRUD
- Manager: Create, Assign, Track
- Worker: View assigned, Update status
- Viewer: View only

---

### Module 6: Staff Management
**Tables Needed:**
- `attendance` - Clock in/out records
- `leave_requests` - Leave management
- `payroll` - Salary records
- `performance_reviews` - Reviews

**Access Levels:**
- Owner: Full CRUD
- Manager: Manage attendance, View performance
- Worker: View own data, Request leave
- Viewer: ❌ No access

---

### Module 7: Reports & Analytics
**Tables Needed:**
- `report_templates` - Saved reports
- `report_schedules` - Automated reports
- `dashboard_widgets` - Custom widgets

**Access Levels:**
- Owner: All reports, Custom dashboards
- Manager: Operational reports
- Worker: Basic reports
- Viewer: View reports only

---

## API Endpoints Structure

### Authentication & Authorization
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
POST   /api/auth/logout            - Logout
POST   /api/auth/refresh-token     - Refresh JWT
GET    /api/auth/me                - Get current user
PUT    /api/auth/change-password   - Change password
```

### User Management (Super Admin)
```
GET    /api/admin/users            - List all users
GET    /api/admin/users/:id        - Get user details
PUT    /api/admin/users/:id        - Update user
DELETE /api/admin/users/:id        - Delete user
POST   /api/admin/users/:id/suspend - Suspend user
GET    /api/admin/stats            - System statistics
```

### Farm Management (Owner)
```
GET    /api/farms                  - List user's farms
GET    /api/farms/:id              - Get farm details
POST   /api/farms                  - Create farm
PUT    /api/farms/:id              - Update farm
DELETE /api/farms/:id              - Delete farm
```

### Farm Members (Owner)
```
GET    /api/farms/:id/members      - List farm members
POST   /api/farms/:id/members      - Add member
PUT    /api/farms/:id/members/:userId - Update member role
DELETE /api/farms/:id/members/:userId - Remove member
```

### Crops (All roles with different permissions)
```
GET    /api/farms/:farmId/crops            - List crops
GET    /api/farms/:farmId/crops/:id        - Get crop details
POST   /api/farms/:farmId/crops            - Create crop (Owner, Manager)
PUT    /api/farms/:farmId/crops/:id        - Update crop (Owner, Manager)
DELETE /api/farms/:farmId/crops/:id        - Delete crop (Owner only)
POST   /api/farms/:farmId/crops/:id/activities - Add activity (All)
```

### Livestock (All roles with different permissions)
```
GET    /api/farms/:farmId/livestock        - List animals
GET    /api/farms/:farmId/livestock/:id    - Get animal details
POST   /api/farms/:farmId/livestock        - Create (Owner, Manager)
PUT    /api/farms/:farmId/livestock/:id    - Update (Owner, Manager)
DELETE /api/farms/:farmId/livestock/:id    - Delete (Owner only)
POST   /api/farms/:farmId/livestock/:id/health - Add health record
POST   /api/farms/:farmId/livestock/:id/production - Add production
```

### Inventory (Different access levels)
```
GET    /api/farms/:farmId/inventory        - List items
POST   /api/farms/:farmId/inventory        - Create item (Owner, Manager)
PUT    /api/farms/:farmId/inventory/:id    - Update (Owner, Manager)
DELETE /api/farms/:farmId/inventory/:id    - Delete (Owner only)
POST   /api/farms/:farmId/inventory/usage  - Record usage (All)
GET    /api/farms/:farmId/inventory/alerts - Get low stock alerts
```

### Tasks (Role-based access)
```
GET    /api/farms/:farmId/tasks            - List tasks
POST   /api/farms/:farmId/tasks            - Create (Owner, Manager)
PUT    /api/farms/:farmId/tasks/:id        - Update (Owner, Manager)
DELETE /api/farms/:farmId/tasks/:id        - Delete (Owner, Manager)
PUT    /api/farms/:farmId/tasks/:id/status - Update status (Assigned user)
POST   /api/farms/:farmId/tasks/:id/comments - Add comment
```

### Financial (Owner and Manager limited)
```
GET    /api/farms/:farmId/transactions     - List transactions
POST   /api/farms/:farmId/transactions     - Create transaction
GET    /api/farms/:farmId/reports/financial - Financial reports
GET    /api/farms/:farmId/reports/profit-loss - P&L statement
```

---

## Middleware for Authorization

### Role Check Middleware
```javascript
// Check if user has specific role
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied' 
      });
    }
    next();
  };
};

// Usage:
router.get('/admin/users', 
  authenticate, 
  hasRole(['super_admin']), 
  getUsers
);
```

### Permission Check Middleware
```javascript
// Check specific permissions
const hasPermission = (module, action) => {
  return async (req, res, next) => {
    const farmId = req.params.farmId;
    const userId = req.user.id;
    
    // Check user's role in this farm
    const member = await getFarmMember(farmId, userId);
    
    // Check if user has permission for this action
    if (!checkPermission(member.role, module, action)) {
      return res.status(403).json({ 
        message: 'Permission denied' 
      });
    }
    next();
  };
};

// Usage:
router.post('/farms/:farmId/crops',
  authenticate,
  hasPermission('crops', 'create'),
  createCrop
);
```

---

## Frontend Route Protection

### Route Guards
```javascript
// Super Admin routes
<Route path="/admin" element={
  <ProtectedRoute roles={['super_admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />

// Farm Owner routes
<Route path="/farm/:id" element={
  <ProtectedRoute roles={['farm_owner', 'farm_manager']}>
    <FarmDashboard />
  </ProtectedRoute>
} />

// Manager-only features
<Route path="/farm/:id/staff" element={
  <ProtectedRoute 
    roles={['farm_owner']}
    permissions={['staff.manage']}
  >
    <StaffManagement />
  </ProtectedRoute>
} />
```

---

## Summary of Restrictions

| Feature | Owner | Manager | Worker | Viewer |
|---------|-------|---------|--------|--------|
| Create Farm | ✅ | ❌ | ❌ | ❌ |
| Edit Farm Profile | ✅ | ❌ | ❌ | ❌ |
| Add/Remove Staff | ✅ | ❌ | ❌ | ❌ |
| Manage Crops | ✅ | ✅ | 👁️ | 👁️ |
| Manage Livestock | ✅ | ✅ | 👁️ | 👁️ |
| Manage Inventory | ✅ | ✅ | Record | 👁️ |
| View Finances | ✅ | Limited | ❌ | ❌ |
| Create Tasks | ✅ | ✅ | ❌ | ❌ |
| Complete Tasks | ✅ | ✅ | ✅ | ❌ |
| Generate Reports | ✅ | ✅ | Basic | 👁️ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

✅ = Full Access | 👁️ = View Only | ❌ = No Access

---

## Implementation Priority

### Phase 1: Core Authentication & Basic Dashboard
1. User registration and login
2. Role assignment
3. Basic dashboard for Farm Owner
4. Farm profile creation

### Phase 2: Farm Operations
1. Crop management module
2. Livestock management module
3. Basic inventory tracking
4. Task management

### Phase 3: Team Collaboration
1. Staff member invitation system
2. Role-based permissions
3. Task assignment
4. Team calendar

### Phase 4: Advanced Features
1. Financial management
2. Advanced analytics
3. Mobile app
4. Automated reports

### Phase 5: Admin & Scale
1. Super Admin dashboard
2. System-wide analytics
3. Multi-farm management
4. API for third-party integrations

---

This architecture provides a complete, scalable, and secure multi-role farm management system!
