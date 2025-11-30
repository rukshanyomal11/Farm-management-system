import { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchWithAuth, checkTokenAndRedirect } from '../../utils/authHelpers';

const ManagerAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [stats, setStats] = useState({
    totalRecords: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    late: 0
  });

  useEffect(() => {
    if (checkTokenAndRedirect()) return;
    fetchWorkers();
    fetchAttendance();

    // Set up auto-refresh every 10 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchAttendance();
    }, 10000); // Refresh every 10 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [selectedDate]);

  const fetchWorkers = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:5000/api/farm-members');
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setWorkers(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:5000/api/attendance?startDate=${selectedDate}&endDate=${selectedDate}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setAttendance(data.data.records);
          setStats(data.data.statistics);
          setLastUpdate(new Date()); // Update last refresh time
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to load attendance');
      }
    }
  };

  const handleMarkAttendance = async (workerId, status) => {
    try {
      if (checkTokenAndRedirect()) return;

      const response = await fetchWithAuth('http://localhost:5000/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: workerId,
          date: selectedDate,
          status,
          // Don't send clock times - let workers manage their own clock-in/out
          notes: `Status marked by manager`
        })
      });

      if (response.ok) {
        toast.success('Attendance marked successfully!');
        fetchAttendance();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to mark attendance');
      }
    }
  };

  const handleMarkAllPresent = async () => {
    try {
      if (checkTokenAndRedirect()) return;

      const attendanceRecords = workers.map(w => ({
        userId: w.id,
        status: 'present',
        // Don't send clock times - let workers manage their own clock-in/out
        notes: 'Bulk marked present'
      }));

      const response = await fetchWithAuth('http://localhost:5000/api/attendance/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          attendanceRecords
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchAttendance();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to mark bulk attendance');
      }
    }
  };

  const getWorkerAttendance = (workerId) => {
    return attendance.find(a => a.user_id === workerId);
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      half_day: 'bg-yellow-100 text-yellow-800',
      late: 'bg-orange-100 text-orange-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredWorkers = workers.filter(w =>
    w.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Management</h1>
            <p className="text-gray-600">Mark and track worker attendance</p>
          </div>
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Mark All Present
          </button>
        </div>
        {/* Real-time update indicator */}
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-refreshing every 10 seconds</span>
          </div>
          <span className="mx-2">•</span>
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Workers</p>
          <p className="text-2xl font-bold text-gray-800">{workers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-gray-800">{stats.present}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-gray-800">{stats.absent}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Half Day</p>
              <p className="text-2xl font-bold text-gray-800">{stats.halfDay}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Late</p>
              <p className="text-2xl font-bold text-gray-800">{stats.late}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
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
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
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

      {/* Workers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorkers.map((worker) => {
                const workerAttendance = getWorkerAttendance(worker.id);
                return (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {worker.full_name[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {worker.full_name}
                          </div>
                          <div className="text-sm text-gray-500">{worker.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {worker.role === 'field_worker' ? 'Field Worker' : 'Farm Manager'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {workerAttendance ? (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(workerAttendance.status)}`}>
                          {workerAttendance.status.replace('_', ' ').toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not marked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {workerAttendance?.clock_in ? (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Clock className="w-4 h-4 text-green-600" />
                          {workerAttendance.clock_in}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {workerAttendance?.clock_out ? (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Clock className="w-4 h-4 text-red-600" />
                          {workerAttendance.clock_out}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMarkAttendance(worker.id, 'present')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(worker.id, 'absent')}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(worker.id, 'half_day')}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                        >
                          Half Day
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(worker.id, 'late')}
                          className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors"
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No workers found</p>
        </div>
      )}
    </div>
  );
};

export default ManagerAttendance;
