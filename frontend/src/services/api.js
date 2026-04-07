import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://bulk-email-send-6v2r.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 600000, // 10 minutes to match backend timeout
});

/**
 * Send bulk emails
 * @param {File} file - Excel or CSV file
 * @param {string} subject - Email subject
 * @param {string} message - Email message with {{name}} and {{company}} placeholders
 * @returns {Promise<Object>} Response with success, sent, failed counts and logs
 */
export const sendBulkEmails = async (file, subject, message) => {
  console.log('📤 Preparing to send bulk emails request...');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('subject', subject);
  formData.append('message', message);

  console.log('📤 Making POST request to /api/send-emails');

  try {
    const response = await api.post('/send-emails', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Received response from server:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ API request failed:', error);

    // Enhanced error handling
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout: The server took too long to respond. The email process might still be running on the server.');
    }

    if (error.response) {
      // Server responded with an error status
      const serverError = error.response.data?.error || error.message;
      const errorWithDetails = new Error(serverError);
      errorWithDetails.status = error.response.status;
      errorWithDetails.data = error.response.data;
      throw errorWithDetails;
    }

    if (error.request) {
      // No response received
      throw new Error('No response from server. Please check your connection or server status.');
    }

    throw error;
  }
};

export default api;
