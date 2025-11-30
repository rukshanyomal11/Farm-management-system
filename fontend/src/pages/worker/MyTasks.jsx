import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchWithAuth, checkTokenAndRedirect } from '../../utils/authHelpers';
import { 
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Camera,
  FileText,
  X,
  XCircle,
  Image
} from 'lucide-react';

const MyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [taskNotes, setTaskNotes] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionPhoto, setSubmissionPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [taskSubmissions, setTaskSubmissions] = useState([]);
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    fetchTasks();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      if (checkTokenAndRedirect()) return;

      const response = await fetchWithAuth('http://localhost:5000/api/tasks/my-tasks');

      if (response.ok) {
        const data = await response.json();
        const fetchedTasks = data.data.tasks || [];
        
        // Filter: Only show tasks due today or past, or tasks without due_date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const availableTasks = fetchedTasks.filter(task => {
          if (!task.due_date) return true; // No due date = show immediately
          
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() <= today.getTime(); // Show if due today or past
        });
        
        // Transform backend data to frontend format and fetch submission status
        const transformedTasks = await Promise.all(availableTasks.map(async (task) => {
          // Fetch submissions for this task
          let hasRejection = false;
          let hasPendingSubmission = false;
          try {
            const submissionResponse = await fetchWithAuth(`http://localhost:5000/api/task-submissions/${task.id}/submissions`);
            if (submissionResponse.ok) {
              const submissionData = await submissionResponse.json();
              const submissions = submissionData.data || [];
              
              // Check for pending submission
              hasPendingSubmission = submissions.some(s => s.status === 'pending');
              
              // Only show rejection if latest submission is rejected (and no pending)
              if (!hasPendingSubmission && submissions.length > 0) {
                const sortedSubmissions = [...submissions].sort((a, b) => 
                  new Date(b.submitted_at) - new Date(a.submitted_at)
                );
                hasRejection = sortedSubmissions[0].status === 'rejected';
              }
            }
          } catch (err) {
            console.error('Error fetching submission for task:', task.id);
          }

          return {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            deadline: task.due_date,
            status: task.status,
            location: task.location || 'Not specified',
            assignedBy: task.created_by_name || 'Farm Manager',
            estimatedHours: task.estimated_hours || 0,
            cropName: task.crop_name || null,
            hasRejection: hasRejection && !hasPendingSubmission, // Only show rejection if no pending submission
            hasPendingSubmission: hasPendingSubmission
          };
        }));

        setTasks(transformedTasks);
        setFilteredTasks(transformedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to load tasks');
      }
    }
  };

  useEffect(() => {
    let filtered = tasks;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus]);

  const handleMarkComplete = async (taskId) => {
    // Open submission modal instead of directly marking complete
    const task = tasks.find(t => t.id === taskId);
    setSelectedTask(task);
    setShowSubmitModal(true);
  };

  const handleSubmitTask = async () => {
    if (!submissionNotes.trim()) {
      toast.error('Please add notes about the completed work');
      return;
    }

    try {
      if (checkTokenAndRedirect()) return;

      const formData = new FormData();
      formData.append('notes', submissionNotes);
      if (submissionPhoto) {
        formData.append('photo', submissionPhoto);
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/task-submissions/${selectedTask.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Task submitted successfully!');
        setSubmissionNotes('');
        setSubmissionPhoto(null);
        setPhotoPreview(null);
        setShowSubmitModal(false);
        setShowDetailsModal(false);
        fetchTasks(); // Reload tasks
      } else {
        toast.error('Failed to submit task');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to submit task');
      }
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSubmissionPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSubmissionPhoto(null);
    setPhotoPreview(null);
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
    fetchTaskSubmissions(task.id);
  };

  const fetchTaskSubmissions = async (taskId) => {
    try {
      if (checkTokenAndRedirect()) return;

      const response = await fetchWithAuth(`http://localhost:5000/api/task-submissions/${taskId}/submissions`);

      if (response.ok) {
        const data = await response.json();
        setTaskSubmissions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleAddNote = () => {
    if (!taskNotes.trim()) {
      toast.error('Please enter a note');
      return;
    }
    // API call to save note
    toast.success('Note added successfully!');
    setTaskNotes('');
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[priority] || colors.low;
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'in_progress') return <Clock className="w-5 h-5 text-blue-600" />;
    return <AlertCircle className="w-5 h-5 text-orange-600" />;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Tasks</h1>
        <p className="text-gray-600">View and manage your assigned tasks</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange-600">
            {tasks.filter(t => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {tasks.filter(t => t.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
              task.hasRejection ? 'border-2 border-red-400' : task.hasPendingSubmission ? 'border-2 border-yellow-400' : ''
            }`}>
              {task.hasRejection && (
                <div className="bg-red-100 border-b-2 border-red-400 px-4 py-2 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-semibold text-red-800">
                    ⚠️ Manager Rejected - Please review feedback and resubmit
                  </span>
                </div>
              )}
              {task.hasPendingSubmission && (
                <div className="bg-yellow-100 border-b-2 border-yellow-400 px-4 py-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-800">
                    ⏳ Submitted - Waiting for manager review
                  </span>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      task.status === 'completed' ? 'bg-green-100' : 
                      task.status === 'in_progress' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{task.title}</h3>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`text-xs px-3 py-1 rounded-full border ${getPriorityBadge(task.priority)}`}>
                          {task.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadge(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>📍 Location: {task.location}</div>
                        <div>⏰ Deadline: {new Date(task.deadline).toLocaleString()}</div>
                        <div>👤 Assigned by: {task.assignedBy}</div>
                        <div>⏱️ Est. Time: {task.estimatedHours}h</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(task)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    View Details
                  </button>
                  {/* Show resubmit button if rejected OR if not completed and no pending submission */}
                  {(task.hasRejection || (task.status !== 'completed' && !task.hasPendingSubmission)) && (
                    <button
                      onClick={() => handleMarkComplete(task.id)}
                      className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                        task.hasRejection 
                          ? 'bg-orange-600 hover:bg-orange-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {task.hasRejection ? '🔄 Resubmit' : 'Mark Complete'}
                    </button>
                  )}
                  {task.hasPendingSubmission && (
                    <button
                      disabled
                      className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg cursor-not-allowed font-medium border-2 border-yellow-400"
                    >
                      ⏳ Under Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Details Modal */}
      {showDetailsModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Task Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedTask.title}</h3>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadge(selectedTask.status)}`}>
                    {selectedTask.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <span className={`text-xs px-3 py-1 rounded-full border ${getPriorityBadge(selectedTask.priority)}`}>
                    {selectedTask.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-medium text-gray-800">{selectedTask.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Deadline</p>
                  <p className="font-medium text-gray-800">{new Date(selectedTask.deadline).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Add Notes</h4>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Add your observations or notes about this task..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="4"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAddNote}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Add Note
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Camera className="w-4 h-4" />
                    Add Photo
                  </button>
                </div>
              </div>

              {/* Submission History */}
              {taskSubmissions.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">Submission History</h4>
                    <button
                      onClick={() => setShowSubmissionHistory(!showSubmissionHistory)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showSubmissionHistory ? 'Hide' : 'Show'} ({taskSubmissions.length})
                    </button>
                  </div>

                  {showSubmissionHistory && (
                    <div className="space-y-3">
                      {taskSubmissions.map((submission, index) => (
                        <div 
                          key={submission.id} 
                          className={`p-4 rounded-lg border-2 ${
                            submission.status === 'approved' 
                              ? 'border-green-200 bg-green-50' 
                              : submission.status === 'rejected'
                              ? 'border-red-200 bg-red-50'
                              : 'border-yellow-200 bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                              Submission #{taskSubmissions.length - index}
                            </span>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              submission.status === 'approved' 
                                ? 'bg-green-600 text-white' 
                                : submission.status === 'rejected'
                                ? 'bg-red-600 text-white'
                                : 'bg-yellow-600 text-white'
                            }`}>
                              {submission.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-sm text-gray-700 mb-2">
                            <strong>Your Notes:</strong> {submission.notes}
                          </div>

                          {submission.photo_url && (
                            <div className="mb-2">
                              <img 
                                src={`http://localhost:5000${submission.photo_url}`}
                                alt="Submission" 
                                className="h-32 rounded border border-gray-300"
                              />
                            </div>
                          )}

                          <div className="text-xs text-gray-500 mb-2">
                            Submitted: {new Date(submission.submitted_at).toLocaleString()}
                          </div>

                          {submission.status === 'rejected' && submission.review_notes && (
                            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                              <div className="flex items-start gap-2">
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-red-800 text-sm">Manager Feedback:</p>
                                  <p className="text-red-700 text-sm">{submission.review_notes}</p>
                                  {submission.reviewed_by_name && (
                                    <p className="text-xs text-red-600 mt-1">
                                      Reviewed by: {submission.reviewed_by_name} on {new Date(submission.reviewed_at).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {submission.status === 'approved' && (
                            <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-green-800 text-sm">Approved by Manager</p>
                                  {submission.review_notes && (
                                    <p className="text-green-700 text-sm">{submission.review_notes}</p>
                                  )}
                                  {submission.reviewed_by_name && (
                                    <p className="text-xs text-green-600 mt-1">
                                      Reviewed by: {submission.reviewed_by_name} on {new Date(submission.reviewed_at).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Show submit button if: no pending submission AND (not completed OR has rejection) */}
              {!taskSubmissions.some(s => s.status === 'pending') && (() => {
                const sortedSubmissions = [...taskSubmissions].sort((a, b) => 
                  new Date(b.submitted_at) - new Date(a.submitted_at)
                );
                const latestIsRejected = sortedSubmissions.length > 0 && sortedSubmissions[0].status === 'rejected';
                return selectedTask.status !== 'completed' || latestIsRejected;
              })() && (
                <button
                  onClick={() => {
                    handleMarkComplete(selectedTask.id);
                    setShowDetailsModal(false);
                  }}
                  className={`w-full px-4 py-3 text-white rounded-lg transition-colors font-semibold ${
                    (() => {
                      // Check if latest submission is rejected
                      const sortedSubmissions = [...taskSubmissions].sort((a, b) => 
                        new Date(b.submitted_at) - new Date(a.submitted_at)
                      );
                      const latestIsRejected = sortedSubmissions.length > 0 && sortedSubmissions[0].status === 'rejected';
                      return latestIsRejected ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700';
                    })()
                  }`}
                >
                  {(() => {
                    // Check if latest submission is rejected
                    const sortedSubmissions = [...taskSubmissions].sort((a, b) => 
                      new Date(b.submitted_at) - new Date(a.submitted_at)
                    );
                    const latestIsRejected = sortedSubmissions.length > 0 && sortedSubmissions[0].status === 'rejected';
                    return latestIsRejected ? '🔄 Resubmit Task (Address Feedback)' : 'Submit Completed Task';
                  })()}
                </button>
              )}
              {taskSubmissions.some(s => s.status === 'pending') && (
                <div className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg font-semibold border-2 border-yellow-400 text-center">
                  ⏳ Submission Under Review - Waiting for Manager
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Submission Modal */}
      {showSubmitModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Submit Completed Task</h2>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmissionNotes('');
                  setSubmissionPhoto(null);
                  setPhotoPreview(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedTask.title}</h3>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Work Completion Notes *</h4>
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Describe the work you completed, any issues encountered, and final results..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="6"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Required: Explain what work was completed</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Upload Photo (Optional)</h4>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {photoPreview && (
                    <div className="relative inline-block">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="max-w-full h-48 rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={removePhoto}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">Upload a photo to document completed work (max 5MB)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSubmissionNotes('');
                    setSubmissionPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTask}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Submit Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
