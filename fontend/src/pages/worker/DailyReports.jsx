import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FileText,
  Camera,
  Send,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

const DailyReports = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    tasksCompleted: '',
    observations: '',
    issues: '',
    equipment: '',
    weatherConditions: 'sunny',
    hoursWorked: ''
  });
  const [reportHistory, setReportHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    fetchReportHistory();
  }, [navigate]);

  const fetchReportHistory = () => {
    // Mock data - replace with API call
    const mockReports = [
      {
        id: 1,
        date: '2025-11-27',
        tasksCompleted: 'Irrigated tomato field section A, Fed livestock morning shift',
        observations: 'Tomato plants showing good growth, slight pest activity in northeast corner',
        issues: 'Irrigation valve #3 needs maintenance',
        equipment: 'Tractor, irrigation system, feed storage',
        weatherConditions: 'sunny',
        hoursWorked: 9,
        status: 'submitted'
      },
      {
        id: 2,
        date: '2025-11-26',
        tasksCompleted: 'Harvested wheat north field, Equipment maintenance',
        observations: 'Wheat quality excellent this season',
        issues: 'None',
        equipment: 'Harvester, maintenance tools',
        weatherConditions: 'partly_cloudy',
        hoursWorked: 8.5,
        status: 'submitted'
      }
    ];
    setReportHistory(mockReports);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    
    // Validation
    if (!reportData.tasksCompleted.trim()) {
      toast.error('Please describe tasks completed');
      return;
    }
    if (!reportData.hoursWorked) {
      toast.error('Please enter hours worked');
      return;
    }

    // Mock API call
    toast.success('Daily report submitted successfully!');
    
    // Reset form
    setReportData({
      date: new Date().toISOString().split('T')[0],
      tasksCompleted: '',
      observations: '',
      issues: '',
      equipment: '',
      weatherConditions: 'sunny',
      hoursWorked: ''
    });
    
    // Refresh history
    fetchReportHistory();
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      sunny: '☀️',
      partly_cloudy: '⛅',
      cloudy: '☁️',
      rainy: '🌧️',
      windy: '💨'
    };
    return icons[condition] || '☀️';
  };

  const getWeatherLabel = (condition) => {
    const labels = {
      sunny: 'Sunny',
      partly_cloudy: 'Partly Cloudy',
      cloudy: 'Cloudy',
      rainy: 'Rainy',
      windy: 'Windy'
    };
    return labels[condition] || 'Sunny';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Daily Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit New Report */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-600" />
              Submit Today's Report
            </h2>
          </div>
          
          <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={reportData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Tasks Completed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasks Completed <span className="text-red-500">*</span>
              </label>
              <textarea
                name="tasksCompleted"
                value={reportData.tasksCompleted}
                onChange={handleInputChange}
                placeholder="Describe all tasks you completed today..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
                required
              />
            </div>

            {/* Observations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Observations
              </label>
              <textarea
                name="observations"
                value={reportData.observations}
                onChange={handleInputChange}
                placeholder="Any observations about crops, livestock, or field conditions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
              />
            </div>

            {/* Issues/Problems */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issues or Problems
              </label>
              <textarea
                name="issues"
                value={reportData.issues}
                onChange={handleInputChange}
                placeholder="Report any problems, equipment failures, or concerns..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="2"
              />
            </div>

            {/* Equipment Used */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Used
              </label>
              <input
                type="text"
                name="equipment"
                value={reportData.equipment}
                onChange={handleInputChange}
                placeholder="List equipment and tools used today"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Weather Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weather Conditions
              </label>
              <select
                name="weatherConditions"
                value={reportData.weatherConditions}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="sunny">☀️ Sunny</option>
                <option value="partly_cloudy">⛅ Partly Cloudy</option>
                <option value="cloudy">☁️ Cloudy</option>
                <option value="rainy">🌧️ Rainy</option>
                <option value="windy">💨 Windy</option>
              </select>
            </div>

            {/* Hours Worked */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours Worked <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hoursWorked"
                value={reportData.hoursWorked}
                onChange={handleInputChange}
                placeholder="8"
                step="0.5"
                min="0"
                max="24"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos (Optional)
              </label>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Camera className="w-5 h-5" />
                Upload Photos
              </button>
              <p className="text-xs text-gray-500 mt-1">You can attach photos of your work</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              <Send className="w-5 h-5" />
              Submit Report
            </button>
          </form>
        </div>

        {/* Report History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Report History
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            {reportHistory.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reports submitted yet</p>
              </div>
            ) : (
              reportHistory.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(report.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {getWeatherIcon(report.weatherConditions)} {getWeatherLabel(report.weatherConditions)} • 
                        ⏱️ {report.hoursWorked}h worked
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Submitted
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {report.tasksCompleted}
                  </p>
                  
                  {report.issues && report.issues !== 'None' && (
                    <div className="flex items-start gap-2 mb-3 p-2 bg-yellow-50 rounded">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className="text-xs text-yellow-800">{report.issues}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleViewReport(report)}
                    className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Full Report
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* View Report Modal */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Daily Report Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Date and Status */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-600">Report Date</p>
                  <p className="text-lg font-bold text-gray-800">
                    {new Date(selectedReport.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-full">
                  Submitted
                </span>
              </div>

              {/* Weather & Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Weather</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {getWeatherIcon(selectedReport.weatherConditions)} {getWeatherLabel(selectedReport.weatherConditions)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Hours Worked</p>
                  <p className="text-lg font-semibold text-gray-800">
                    ⏱️ {selectedReport.hoursWorked} hours
                  </p>
                </div>
              </div>

              {/* Tasks Completed */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Tasks Completed</h3>
                <p className="text-gray-700 whitespace-pre-line">{selectedReport.tasksCompleted}</p>
              </div>

              {/* Observations */}
              {selectedReport.observations && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Field Observations</h3>
                  <p className="text-gray-700 whitespace-pre-line">{selectedReport.observations}</p>
                </div>
              )}

              {/* Issues */}
              {selectedReport.issues && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Issues Reported
                  </h3>
                  <p className="text-yellow-800">{selectedReport.issues}</p>
                </div>
              )}

              {/* Equipment */}
              {selectedReport.equipment && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Equipment Used</h3>
                  <p className="text-gray-700">{selectedReport.equipment}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReports;
