// src/pages/Dashboard/Dashboard.jsx
import { Link } from 'react-router-dom';
import { useUser, useInterviewHistory } from '../../hooks/redux';

const Dashboard = () => {
  const user = useUser();
  const history = useInterviewHistory();

  const stats = {
    totalSessions: history.length,
    averageScore: history.length > 0 
      ? Math.round(history.reduce((sum, session) => sum + (session.averageScore || 0), 0) / history.length)
      : 0,
    totalQuestions: history.reduce((sum, session) => sum + (session.questions?.length || 0), 0),
  };

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-gray-600">
            Ready to practice your interview skills? Let's get started with a new session.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalSessions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⭐</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Score
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.averageScore}/10
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">❓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Questions Answered
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalQuestions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Start New Interview
            </h3>
            <p className="text-gray-600 mb-4">
              Practice with AI-generated questions tailored to your skill level and interests.
            </p>
            <Link
              to="/interview/setup"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              style={{ textDecoration: 'none' }}
            >
              Start Practice Session
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Review History
            </h3>
            <p className="text-gray-600 mb-4">
              Check your previous sessions and track your progress over time.
            </p>
            <Link
              to="/interview/history"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View History
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {history.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {history.slice(0, 3).map((session, index) => (
                <div key={session.id || index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.category} Interview
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {session.averageScore || 0}/10
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.questions?.length || 0} questions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
