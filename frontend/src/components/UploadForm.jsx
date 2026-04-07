import { useState } from 'react';
import { sendBulkEmails } from '../services/api';

const UploadForm = ({ onEmailSent }) => {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Email templates
  const EMAIL_SUBJECT_TEMPLATE = "Focus on Growth, Not Payroll – Get Started with Free HRM ERP Today";

  const EMAIL_BODY_TEMPLATE = `Dear {{name}},

Greetings from Xpertance, Pune.

We are pleased to introduce our Pre-Primary ERP Software, specially designed for Play Schools, Preschools, Montessori, and Daycare Centers.

Our ERP Key Modules:
• Student Admission Management
• Fee Collection & Auto Receipts
• Attendance Tracking
• Parent Mobile App
• Daily Activity Reports
• Staff & Payroll Management

Benefits:
• Reduce paperwork by 80%
• Improve parent engagement
• Centralized management
• Secure cloud system

We would love to schedule a FREE demo.

Looking forward to your response.

Best regards,
Your Name`;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileName = selectedFile.name.toLowerCase();
      const isValid = validExtensions.some(ext => fileName.endsWith(ext));

      if (isValid) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsSending(true);

    try {
      const response = await sendBulkEmails(file, subject, message);
      onEmailSent(response);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send emails';
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Compose Email</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Excel/CSV File *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={isSending}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                Excel or CSV up to 10MB. Need columns: Name, Company, Email
              </p>
              {file && (
                <p className="text-sm font-medium text-green-600 flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {file.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Subject Input */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Enter email subject"
            />
            <button
              type="button"
              onClick={() => setSubject(EMAIL_SUBJECT_TEMPLATE)}
              disabled={isSending}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-400 font-medium text-sm whitespace-nowrap"
            >
              Insert Subject
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click "Insert Subject" to auto-fill the subject line.
          </p>
        </div>

        {/* Message Textarea */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            placeholder="Enter your email message. Use {{name}} and {{company}} for personalization."
          />
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => setMessage(EMAIL_BODY_TEMPLATE)}
              disabled={isSending}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-blue-400 font-medium"
            >
              Insert Email Template
            </button>
            <button
              type="button"
              onClick={() => {
                setSubject(EMAIL_SUBJECT_TEMPLATE);
                setMessage(EMAIL_BODY_TEMPLATE);
              }}
              disabled={isSending}
              className="text-sm text-green-600 hover:text-green-800 disabled:text-green-400 font-medium"
            >
              Insert Full Template (Subject + Body)
            </button>
            <p className="text-xs text-gray-500">
              Use {'{{name}}'} and {'{{company}}'} to personalize emails.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSending || !file || !subject || !message}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Emails...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Emails
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
