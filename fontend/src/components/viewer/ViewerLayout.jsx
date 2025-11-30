import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Eye,
  LayoutDashboard,
  Sprout,
  Beef,
  BarChart3,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const ViewerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');
    
    if (!user || !token) {
      navigate('/login');
      return;
    }
    
    setUserData(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const menuItems = [
    { path: '/viewer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/viewer/crops', icon: Sprout, label: 'Crop Records' },
    { path: '/viewer/livestock', icon: Beef, label: 'Livestock Data' },
    { path: '/viewer/reports', icon: BarChart3, label: 'Reports & Analytics' },
    { path: '/viewer/calendar', icon: Calendar, label: 'Farm Calendar' },
    { path: '/viewer/recommendations', icon: FileText, label: 'My Recommendations' },
    { path: '/viewer/comments', icon: MessageSquare, label: 'Comments' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-cyan-600 to-teal-600 shadow-lg z-40">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">Farm Viewer Portal</h1>
                <p className="text-xs text-cyan-100">Consultant & Advisory Access</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Info */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{userData?.full_name || 'Viewer'}</p>
                <p className="text-xs text-cyan-100">Consultant</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white shadow-xl z-30
        transform transition-transform duration-300 lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <nav className="h-full flex flex-col">
          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-6 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all
                    ${active 
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-cyan-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg">
              <p className="text-xs font-semibold text-cyan-900 mb-1">👁️ Viewer Access</p>
              <p className="text-xs text-cyan-700">Read-only consultant mode</p>
            </div>
            
            {/* Mobile Logout */}
            <button
              onClick={handleLogout}
              className="lg:hidden w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ViewerLayout;
