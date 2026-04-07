import { readExcelFile } from '../services/excelService.js';
import { sendEmails } from '../services/emailService.js';
import fs from 'fs';
import path from 'path';

/**
 * Controller to handle bulk email sending
 */
export const sendEmailsBatch = async (req, res) => {
  let filePath = null;
  console.log('🚀 Starting email batch request');

  // Set a safety timeout to ensure we always respond
  const timeoutMs = 10 * 60 * 1000; // 10 minutes
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout after 10 minutes')), timeoutMs);
  });

  try {
    // Race the main operation against timeout
    const result = await Promise.race([
      (async () => {
        const file = req.file;

        // Debug: Log full file object
        console.log('📥 Uploaded file received:', {
          originalname: file?.originalname,
          path: file?.path,
          size: file?.size,
          mimetype: file?.mimetype
        });

        // Validate required fields
        if (!file) {
          console.log('❌ No file uploaded');
          return { status: 400, body: { success: false, error: 'No file uploaded' } };
        }

        filePath = file.path;
        console.log('📁 File saved at:', filePath);

        // Parse Excel/CSV file
        console.log('📖 Starting Excel file parsing...');
        const recipients = await readExcelFile(filePath);
        console.log(`✅ Parsed ${recipients.length} recipients`);

        if (recipients.length === 0) {
          // Clean up file
          if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          console.log('❌ No valid recipients found');
          return { status: 400, body: { success: false, error: 'No valid recipients found in the file. Ensure columns: Name, Company, Email' } };
        }

        console.log(`📊 Processing ${recipients.length} recipients`);

        // Fixed email templates
        const subjectTemplate = "Focus on Growth, Not Payroll – Get Started with Free HRM ERP Today";
        const bodyTemplate = `Dear {{name}},

Greetings from Xpertance, Pune.

We are pleased to introduce our Pre-Primary ERP Software, specially designed for Play Schools, Preschools, Montessori, and Daycare Centers to simplify their daily operations and enhance parent communication.

Our ERP Key Modules:
• Student Admission Management
• Fee Collection & Auto Receipts
• Attendance Tracking
• Parent Mobile App
• Daily Activity Reports
• Staff & Payroll Management

Benefits for Your Institution:
• Reduce manual paperwork by 80%
• Improve parent engagement
• Centralized school data management
• Secure and scalable cloud system

We would be happy to schedule a FREE live demo at your convenient time and show how our ERP can digitally transform your preschool operations.

Please find the portfolio attached for your reference.

Looking forward to your response.

Best regards,
Your Name`;

        // Send emails
        console.log('📤 Starting email sending process...');
        const results = await sendEmails(recipients, subjectTemplate, bodyTemplate);
        console.log('✅ Email sending process completed');

        const sentCount = results.filter(r => r.status === 'sent').length;
        const failedCount = results.filter(r => r.status === 'failed').length;

        console.log(`📈 Results: ${sentCount} sent, ${failedCount} failed out of ${recipients.length}`);

        // Clean up file before sending response
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('🗑️ File cleaned up:', filePath);
        }

        console.log('📤 Sending response to frontend');
        return { status: 200, body: { success: true, sent: sentCount, failed: failedCount, total: recipients.length, logs: results } };
      })()
    ], timeoutPromise);

    return res.status(result.status).json(result.body);

  } catch (error) {
    console.error('❌ Email sending error:', error);
    console.error('Error stack:', error.stack);

    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('🗑️ File cleaned up after error:', filePath);
      } catch (cleanupError) {
        console.error('❌ Failed to clean up file:', cleanupError);
      }
    }

    // Determine status code
    const statusCode = error.message.includes('timeout') ? 504 : 500;
    console.log(`📤 Sending error response to frontend (status: ${statusCode})`);

    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to send emails'
    });
  }
};
