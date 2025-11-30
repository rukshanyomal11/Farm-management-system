import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminLogin from './pages/AdminLogin'
import AdminRegister from './pages/AdminRegister'
import ViewerLogin from './pages/ViewerLogin'
import ViewerRegister from './pages/ViewerRegister'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import FarmManagement from './pages/admin/FarmManagement'
import FarmOwnerLayout from './components/farmer/FarmOwnerLayout'
import FarmOwnerDashboard from './pages/FarmOwnerDashboard'
import CropManagement from './pages/farmer/CropManagement'
import LivestockManagement from './pages/farmer/LivestockManagement'
import InventoryManagement from './pages/farmer/InventoryManagement'
import TaskManagement from './pages/farmer/TaskManagement';
import StaffManagement from './pages/farmer/StaffManagement';
import FarmStaff from './pages/farmer/FarmStaff';
import ManagerLayout from './components/manager/ManagerLayout'
import ManagerDashboard from './pages/ManagerDashboard'
import StaffCoordination from './pages/manager/StaffCoordination'
import ManagerAttendance from './pages/manager/ManagerAttendance'
import ManagerCropOperations from './pages/manager/ManagerCropOperations'
import ManagerLivestockOperations from './pages/manager/ManagerLivestockOperations'
import ManagerInventoryUpdates from './pages/manager/ManagerInventoryUpdates'
import TaskSubmissions from './pages/manager/TaskSubmissions'
import WorkerLayout from './components/worker/WorkerLayout'
import WorkerDashboard from './pages/WorkerDashboard'
import MyTasks from './pages/worker/MyTasks'
import WorkerAttendance from './pages/worker/WorkerAttendance'
import DailyReports from './pages/worker/DailyReports'
import ViewCrops from './pages/worker/ViewCrops'
import ViewerLayout from './components/viewer/ViewerLayout'
import ViewerDashboard from './pages/ViewerDashboard'
import ViewerCropRecords from './pages/viewer/ViewerCropRecords'
import ViewerLivestockRecords from './pages/viewer/ViewerLivestockRecords'
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
        
        {/* Viewer/Consultant Auth Routes */}
        <Route path="/viewer/login" element={<ViewerLogin />} />
        <Route path="/viewer/register" element={<ViewerRegister />} />
        
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
          <Route path="staff" element={<StaffCoordination />} />
        </Route>

        {/* Farm Manager Routes */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="staff" element={<StaffCoordination />} />
          <Route path="tasks" element={<TaskManagement />} />
          <Route path="submissions" element={<TaskSubmissions />} />
          <Route path="attendance" element={<ManagerAttendance />} />
          <Route path="crops" element={<ManagerCropOperations />} />
          <Route path="livestock" element={<ManagerLivestockOperations />} />
          <Route path="inventory" element={<ManagerInventoryUpdates />} />
        </Route>

        {/* Farm Worker Routes */}
        <Route path="/worker" element={<WorkerLayout />}>
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="attendance" element={<WorkerAttendance />} />
          <Route path="reports" element={<DailyReports />} />
          <Route path="crops" element={<ViewCrops />} />
        </Route>

        {/* Viewer/Consultant Routes */}
        <Route path="/viewer" element={<ViewerLayout />}>
          <Route path="dashboard" element={<ViewerDashboard />} />
          <Route path="crops" element={<ViewerCropRecords />} />
          <Route path="livestock" element={<ViewerLivestockRecords />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
