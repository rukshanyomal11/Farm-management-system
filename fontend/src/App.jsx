import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminLogin from './pages/AdminLogin'
import AdminRegister from './pages/AdminRegister'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import FarmManagement from './pages/admin/FarmManagement'
import FarmOwnerLayout from './components/farmer/FarmOwnerLayout'
import FarmOwnerDashboard from './pages/FarmOwnerDashboard'
import CropManagement from './pages/farmer/CropManagement'
import LivestockManagement from './pages/farmer/LivestockManagement'
import InventoryManagement from './pages/farmer/InventoryManagement'
import ManagerLayout from './components/manager/ManagerLayout'
import ManagerDashboard from './pages/ManagerDashboard'
import StaffCoordination from './pages/manager/StaffCoordination'
import ManagerCropOperations from './pages/manager/ManagerCropOperations'
import ManagerLivestockOperations from './pages/manager/ManagerLivestockOperations'
import ManagerInventoryUpdates from './pages/manager/ManagerInventoryUpdates'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        
        {/* Admin Dashboard with Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="farms" element={<FarmManagement />} />
        </Route>

        {/* Farm Owner Routes */}
        <Route path="/dashboard" element={<FarmOwnerLayout />}>
          <Route index element={<FarmOwnerDashboard />} />
          <Route path="crops" element={<CropManagement />} />
          <Route path="livestock" element={<LivestockManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
        </Route>

        {/* Farm Manager Routes */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="staff" element={<StaffCoordination />} />
          <Route path="crops" element={<ManagerCropOperations />} />
          <Route path="livestock" element={<ManagerLivestockOperations />} />
          <Route path="inventory" element={<ManagerInventoryUpdates />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
