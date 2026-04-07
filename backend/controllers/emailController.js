import { readExcelFile } from '../services/excelService.js';
import { sendEmails } from '../services/emailService.js';
import fs from 'fs';
import path from 'path';

/**
 * Controller to handle bulk email sending
 */
export const sendEmailsBatch = async (req, res) => {
  let filePath = null;

  try {
    const file = req.file;

    // Debug: Log full file object
    console.log('📥 Uploaded file received:', JSON.stringify(file, null, 2));

    // Validate required fields
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    filePath = file.path;
    console.log('📁 File saved at:', filePath);

    // Parse Excel/CSV file
    const recipients = await readExcelFile(filePath);

    if (recipients.length === 0) {
      // Clean up file
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        error: 'No valid recipients found in the file. Ensure columns: Name, Company, Email'
      });
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
    const results = await sendEmails(recipients, subjectTemplate, bodyTemplate);

    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    // Clean up file after response is sent
    const cleanup = () => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ File cleaned up:', filePath);
      }
    };

    res.on('close', cleanup);
    res.on('finish', cleanup);

    return res.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: recipients.length,
      logs: results
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);

    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ File cleaned up after error:', filePath);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send emails'
    });
  }
};
