import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Clock, Award, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffCoordination = () => {
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchStaff();
  }, [selectedDate]);

  const fetchStaff = () => {
    // Mock data - replace with API call
    const mockStaff = [
      {
        id: 1,
        name: 'John Doe',
        role: 'Field Worker',
        status: 'present',
        clockIn: '08:00 AM',
        clockOut: null,
        tasksCompleted: 3,
        tasksAssigned: 5,
        performance: 85
      },
      {
        id: 2,
        name: 'Sarah Wilson',
        role: 'Livestock Caretaker',
        status: 'present',
        clockIn: '07:45 AM',
        clockOut: null,
        tasksCompleted: 4,
        tasksAssigned: 6,
        performance: 92
      },
      {
        id: 3,
        name: 'Mike Brown',
        role: 'Equipment Operator',
        status: 'present',
        clockIn: '08:15 AM',
        clockOut: null,
        tasksCompleted: 2,
        tasksAssigned: 4,
        performance: 78
      },
      {
        id: 4,
        name: 'Emily Davis',
        role: 'Field Worker',
        status: 'absent',
        clockIn: null,
        clockOut: null,
        tasksCompleted: 0,
        tasksAssigned: 3,
        performance: 88
      },
      {
        id: 5,
        name: 'Tom Martinez',
        role: 'Field Worker',
        status: 'present',
        clockIn: '08:05 AM',
        clockOut: null,
        tasksCompleted: 3,
        tasksAssigned: 5,
        performance: 90
      }
    ];
    setStaff(mockStaff);
  };

  const handleMarkAttendance = (staffId, status) => {
    setStaff(staff.map(s => 
      s.id === staffId ? { 
        ...s, 
        status, 
        clockIn: status === 'present' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null 
      } : s
    ));
    toast.success(`Attendance marked as ${status}`);
  };

  const getStatusBadge = (status) => {
    if (status === 'present') return 'bg-green-100 text-green-800';
    if (status === 'absent') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const presentCount = staff.filter(s => s.status === 'present').length;
  const absentCount = staff.filter(s => s.status === 'absent').length;
  const avgPerformance = Math.round(staff.reduce((sum, s) => sum + s.performance, 0) / staff.length);

  return (
    <div className='p-4'>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff Coordination</h1>
        <p className="text-gray-600">Manage team attendance, tasks, and performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
          <p className="text-sm text-gray-600">Total Staff</p>
          <p className="text-2xl font-bold text-gray-800">{staff.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-gray-800">{presentCount}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent Today</p>
              <p className="text-2xl font-bold text-gray-800">{absentCount}</p>
            </div>
            <UserX className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-800">{avgPerformance}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In/Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">{member.name[0]}</span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{member.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusBadge(member.status)}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {member.clockIn || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className="text-green-600 font-semibold">{member.tasksCompleted}</span>
                      <span className="text-gray-400"> / </span>
                      <span className="text-gray-600">{member.tasksAssigned}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Award className={`w-4 h-4 ${getPerformanceColor(member.performance)}`} />
                      <span className={`text-sm font-semibold ${getPerformanceColor(member.performance)}`}>
                        {member.performance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {member.status === 'absent' ? (
                      <button
                        onClick={() => handleMarkAttendance(member.id, 'present')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Mark Present
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAttendance(member.id, 'absent')}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Mark Absent
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
          <p className="text-gray-500">No staff members found</p>
        </div>
      )}
    </div>
  );
};

export default StaffCoordination;
