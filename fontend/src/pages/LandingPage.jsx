import { Link } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Eye, 
  Sprout, 
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';

const LandingPage = () => {
  const roles = [
    {
      title: 'Farm Owner',
      description: 'Manage your farm operations, staff, and resources',
      icon: Sprout,
      color: 'from-green-600 to-emerald-600',
      loginPath: '/login',
      registerPath: '/register',
      features: ['Full farm control', 'Staff management', 'Financial reports']
    },
    {
      title: 'System Admin',
      description: 'Manage users, farms, and system settings',
      icon: Shield,
      color: 'from-blue-600 to-indigo-600',
      loginPath: '/admin/login',
      registerPath: '/admin/register',
      features: ['User management', 'System settings', 'Analytics']
    },
    {
      title: 'Viewer/Consultant',
      description: 'Advisory access to farm data and analytics',
      icon: Eye,
      color: 'from-cyan-600 to-teal-600',
      loginPath: '/viewer/login',
      registerPath: '/viewer/register',
      features: ['Read-only access', 'Add recommendations', 'View reports']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Farm Management System</h1>
                <p className="text-sm text-gray-600">Manage your farm with ease</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to Farm Management
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to access the platform. Comprehensive farm management solution for owners, administrators, and consultants.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${role.color} p-8 text-white`}>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
                  <p className="text-white/90 text-sm">{role.description}</p>
                </div>

                {/* Features */}
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ArrowRight className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link
                      to={role.loginPath}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${role.color} text-white rounded-lg hover:shadow-lg transition-all font-semibold`}
                    >
                      <LogIn className="w-5 h-5" />
                      Login
                    </Link>
                    <Link
                      to={role.registerPath}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                    >
                      <UserPlus className="w-5 h-5" />
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Crop Management</h3>
              <p className="text-gray-600 text-sm">Track planting, growth, and harvest cycles efficiently</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Staff Coordination</h3>
              <p className="text-gray-600 text-sm">Manage workers, assign tasks, and track attendance</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Analytics & Reports</h3>
              <p className="text-gray-600 text-sm">Get insights and generate comprehensive reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            © 2025 Farm Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
