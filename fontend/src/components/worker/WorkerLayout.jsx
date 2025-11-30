import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard,
  ClipboardList,
  Clock,
  FileText,
  Sprout,
  Bird,
  Calendar,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';

const WorkerLayout = () => {
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
      path: '/worker/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      color: 'text-blue-600'
    },
    { 
      path: '/worker/tasks', 
      icon: ClipboardList, 
      label: 'My Tasks',
      color: 'text-orange-600'
    },
    { 
      path: '/worker/attendance', 
      icon: Clock, 
      label: 'Attendance',
      color: 'text-green-600'
    },
    { 
      path: '/worker/reports', 
      icon: FileText, 
      label: 'Daily Reports',
      color: 'text-purple-600'
    },
    { 
      path: '/worker/crops', 
      icon: Sprout, 
      label: 'View Crops',
      color: 'text-emerald-600'
    },
    { 
      path: '/worker/livestock', 
      icon: Bird, 
      label: 'View Livestock',
      color: 'text-amber-600'
    },
    { 
      path: '/worker/calendar', 
      icon: Calendar, 
      label: 'Farm Calendar',
      color: 'text-indigo-600'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-40">
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Logo and Menu Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-600 to-amber-600 p-2 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Farm Worker Portal</h1>
                  <p className="text-xs text-gray-600">Field Operations</p>
                </div>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-800">{user.fullName || user.full_name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white shadow-lg z-30 transition-transform duration-300 ease-in-out overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${active 
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : item.color}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs text-orange-800 font-semibold">👷 Farm Worker</p>
            <p className="text-xs text-orange-600">Field Operations</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default WorkerLayout;
