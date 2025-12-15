import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/Toast';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TaskList } from './components/Tasks/TaskList';
import { TaskForm } from './components/Tasks/TaskForm';
import { TaskDetail } from './components/Tasks/TaskDetail';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="font-bold text-xl text-gray-900">RecurringToDo</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                All Tasks
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-8 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <TaskProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/tasks/new" element={<TaskForm />} />
              <Route path="/tasks/:taskId" element={<TaskDetail />} />
              <Route path="/tasks/:taskId/edit" element={<TaskForm />} />
            </Routes>
          </Layout>
          <ToastContainer />
        </TaskProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
