import { useState } from 'react';
import UploadForm from './components/UploadForm';
import StatusLog from './components/StatusLog';

function App() {
  const [results, setResults] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const handleEmailSent = (response) => {
    setResults(response.logs);
    setTotalCount(response.total);
  };

  const handleNewSend = () => {
    setResults(null);
    setTotalCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Cold Mail Sender
          </h1>
          <p className="text-lg text-gray-600">
            Upload your contact list and send personalized emails in bulk
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {(!results || results.length === 0) ? (
            <UploadForm onEmailSent={handleEmailSent} />
          ) : (
            <div>
              <button
                onClick={handleNewSend}
                className="mb-4 bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Send
              </button>
              <StatusLog
                results={results}
                totalCount={totalCount}
                isSending={false}
              />
            </div>
          )}

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-blue-900 font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              How to use
            </h3>
            <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
              <li>Create an Excel file or CSV with columns: <strong>Name</strong>, <strong>Company</strong>, <strong>Email</strong></li>
              <li>Enter your email subject and message</li>
              <li>Use <code className="bg-blue-100 px-1 rounded">{'{{name}}'}</code> and <code className="bg-blue-100 px-1 rounded">{'{{company}}'}</code> to personalize</li>
              <li>Click <strong>Send Emails</strong> and wait for completion</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>Made with ❤️ for productive email campaigns</p>
        </div>
      </div>
    </div>
  );
}

export default App;
