// src/pages/Interview/InterviewHistory.jsx
import { useInterviewHistory } from '../../hooks/redux';

const InterviewHistory = () => {
  const history = useInterviewHistory();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6 w-full">
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Interview History
          </h1>

          {history.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-16 w-16 text-blue-500 mb-6">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No interview sessions yet
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Start your first practice session to see your history here.
              </p>
              <a
                href="/interview/setup"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                style={{ textDecoration: 'none' }}
              >
                Start First Session
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((session, index) => (
                <div
                  key={session.id || index}
                  className="border border-gray-200 rounded-lg p-6 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.category} Interview
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {session.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(session.created_at)}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{session.questions?.length || 0} questions</span>
                        <span>{session.totalTimeSpent || 0} minutes</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreColor(session.averageScore || 0)}`}>
                          {session.averageScore || 0}/10
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Average Score</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-100 transition-colors duration-200">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewHistory;
