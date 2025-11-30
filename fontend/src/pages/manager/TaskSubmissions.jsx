import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText, Image, User, Calendar, Filter, X as CloseIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchWithAuth, checkTokenAndRedirect } from '../../utils/authHelpers';

const TaskSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  
  // Filter states
  const [filterWorker, setFilterWorker] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    fetchSubmissions();
    fetchWorkers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [submissions, filterWorker, filterDateFrom, filterDateTo, filterStatus]);

  const fetchWorkers = async () => {
    try {
      if (checkTokenAndRedirect()) return;

      const response = await fetchWithAuth('http://localhost:5000/api/farm-members');

      if (response.ok) {
        const data = await response.json();
        const workersList = (data.data || []).filter(
          member => member.role === 'field_worker'
        );
        console.log('Workers loaded:', workersList);
        setWorkers(workersList);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...submissions];

    // Filter by worker
    if (filterWorker) {
      console.log('Filtering by worker:', filterWorker);
      console.log('Sample submission:', filtered[0]);
      filtered = filtered.filter(sub => {
        console.log('Comparing:', sub.submitted_by, '===', filterWorker);
        return sub.submitted_by === filterWorker;
      });
      console.log('Filtered results:', filtered.length);
    }

    // Filter by date range
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(sub => {
        const subDate = new Date(sub.submitted_at);
        subDate.setHours(0, 0, 0, 0);
        return subDate >= fromDate;
      });
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(sub => {
        const subDate = new Date(sub.submitted_at);
        return subDate <= toDate;
      });
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === filterStatus);
    }

    setFilteredSubmissions(filtered);
  };

  const clearFilters = () => {
    setFilterWorker('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterStatus('all');
  };

  const pendingCount = filteredSubmissions.filter(s => s.status === 'pending').length;
  const approvedCount = filteredSubmissions.filter(s => s.status === 'approved').length;
  const rejectedCount = filteredSubmissions.filter(s => s.status === 'rejected').length;

  const fetchSubmissions = async () => {
    try {
      if (checkTokenAndRedirect()) return;

      const response = await fetchWithAuth('http://localhost:5000/api/task-submissions/submissions/all');

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to load submissions');
      }
    }
  };

  const handleReview = async (status) => {
    try {
      if (checkTokenAndRedirect()) return;

      const response = await fetchWithAuth(
        `http://localhost:5000/api/task-submissions/submissions/${selectedSubmission.id}/review`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status,
            reviewNotes
          })
        }
      );

      if (response.ok) {
        toast.success(`Submission ${status}!`);
        setShowReviewModal(false);
        setReviewNotes('');
        setSelectedSubmission(null);
        fetchSubmissions();
      } else {
        toast.error('Failed to review submission');
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast.error('Failed to review submission');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Task Submissions</h1>
        <p className="text-gray-600">Review completed tasks from workers</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-gray-800">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-3xl font-bold text-gray-800">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-gray-800">{rejectedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Worker Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Worker</label>
            <select
              value={filterWorker}
              onChange={(e) => setFilterWorker(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Workers</option>
              {workers.map((worker) => (
                <option key={worker.user_id || worker.id} value={worker.user_id || worker.id}>
                  {worker.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filterWorker || filterDateFrom || filterDateTo || filterStatus !== 'all') && (
          <button
            onClick={clearFilters}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {submissions.length === 0 ? 'No submissions yet' : 'No submissions match filters'}
            </h3>
            <p className="text-gray-600">
              {submissions.length === 0 
                ? 'Worker task submissions will appear here' 
                : 'Try adjusting your filter criteria'}
            </p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const statusInfo = getStatusBadge(submission.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={submission.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{submission.task_title}</h3>
                        <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {submission.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Submitted by: {submission.submitted_by_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(submission.submitted_at).toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-3">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Work Notes:
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{submission.notes}</p>
                      </div>

                      {submission.photo_url && (
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Photo:
                          </h4>
                          <a 
                            href={`http://localhost:5000${submission.photo_url}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <img 
                              src={`http://localhost:5000${submission.photo_url}`}
                              alt="Task completion" 
                              className="max-w-full h-48 rounded-lg border border-gray-300 hover:opacity-90 transition-opacity cursor-pointer"
                            />
                          </a>
                        </div>
                      )}

                      {submission.status !== 'pending' && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">Manager Review:</h4>
                          <p className="text-sm text-gray-600 mb-1">
                            Reviewed by: {submission.reviewed_by_name} on {new Date(submission.reviewed_at).toLocaleString()}
                          </p>
                          {submission.review_notes && (
                            <p className="text-gray-700">{submission.review_notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {submission.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowReviewModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowReviewModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <XCircle className="w-4 h-4 inline mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Review Submission</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Task: {selectedSubmission.task_title}</h3>
                <p className="text-sm text-gray-600">Submitted by: {selectedSubmission.submitted_by_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add feedback or comments..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="4"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewNotes('');
                    setSelectedSubmission(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReview('rejected')}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleReview('approved')}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSubmissions;
