import axios from 'axios';

const API_BASE_URL = 'https://bulk-email-send-6v2r.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

/**
 * Send bulk emails
 * @param {File} file - Excel or CSV file
 * @param {string} subject - Email subject
 * @param {string} message - Email message with {{name}} and {{company}} placeholders
 * @returns {Promise<Object>} Response with success, sent, failed counts and logs
 */
export const sendBulkEmails = async (file, subject, message) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subject', subject);
  formData.append('message', message);

  const response = await api.post('/send-emails', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // Keep connection alive for long-running requests
    timeout: 300000, // 5 minutes
  });

  return response.data;
};

export default api;
