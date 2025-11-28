import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard,
  Users,
  Sprout,
  Bird,
  Package,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';

const ManagerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { 
      path: '/manager/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      color: 'text-blue-600'
    },
    { 
      path: '/manager/staff', 
      icon: Users, 
      label: 'Staff Coordination',
      color: 'text-indigo-600'
    },
    { 
      path: '/manager/crops', 
      icon: Sprout, 
      label: 'Crop Operations',
      color: 'text-green-600'
    },
    { 
      path: '/manager/livestock', 
      icon: Bird, 
      label: 'Livestock Operations',
      color: 'text-orange-600'
    },
    { 
      path: '/manager/inventory', 
      icon: Package, 
      label: 'Inventory Updates',
      color: 'text-purple-600'
    },
    { 
      path: '/manager/tasks', 
      icon: ClipboardList, 
      label: 'Task Management',
      color: 'text-pink-600'
    },
    { 
      path: '/manager/reports', 
      icon: BarChart3, 
      label: 'Reports',
      color: 'text-cyan-600'
    },
    { 
      path: '/manager/settings', 
      icon: Settings, 
      label: 'Settings',
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-teal-600 text-white transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-blue-500">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">👨‍🌾</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Manager</h1>
                <p className="text-xs text-blue-200">Operations View</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-blue-500 p-1 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-white text-blue-600 shadow-lg'
                          : 'text-white hover:bg-blue-500'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? item.color : ''}`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-blue-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">{user.fullName?.[0] || 'M'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.fullName || 'Manager'}</p>
                <p className="text-xs text-blue-200 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Farm Manager Dashboard</h2>
                <p className="text-sm text-gray-600">Day-to-day operations management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>© 2024 Farm Management System</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Farm Manager - Operations Access
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ManagerLayout;
