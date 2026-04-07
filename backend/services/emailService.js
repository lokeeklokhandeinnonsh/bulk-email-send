import nodemailer from 'nodemailer';
import { personalizeTemplate } from '../utils/personalize.js';

/**
 * Send emails in batches with delay between each email
 */
export const sendEmails = async (recipients, subjectTemplate, messageTemplate) => {
  const results = [];
  const BATCH_SIZE = 50;
  const DELAY_MS = 1500; // 1.5 seconds between emails
  const TOTAL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minute total timeout

  // Sender configuration
  const senderName = "Lokeek Lokhande";

  console.log(`📧 Starting email send for ${recipients.length} recipients`);
  console.log(`📦 Batch size: ${BATCH_SIZE}, Delay: ${DELAY_MS}ms`);

  // Validate environment variables
  if (!process.env.EMAIL_USER) {
    throw new Error('EMAIL_USER environment variable is required');
  }

  if (!process.env.EMAIL_PASS) {
    throw new Error('EMAIL_PASS environment variable is required');
  }

  if (!senderName || senderName.trim() === '') {
    throw new Error('Sender name is required');
  }

  // Log sender information
  const senderInfo = `"${senderName}" <${process.env.EMAIL_USER}>`;
  console.log('📧 Sender configured:', senderInfo);

  // Create transporter
  console.log('🔧 Creating email transporter...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Connection pooling for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 2,
    // Timeout for connection and socket
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 300000,    // 5 minutes
  });

  // Verify connection
  try {
    console.log('🔍 Verifying transporter connection...');
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    throw new Error('Failed to connect to email server. Check your credentials.');
  }

  // Validate templates before sending
  if (!subjectTemplate || !subjectTemplate.trim()) {
    throw new Error('Email subject is required');
  }

  if (!messageTemplate || !messageTemplate.trim()) {
    throw new Error('Email message is required');
  }

  // Process recipients in batches using a flat loop for better tracking
  console.log(`📊 Will process ${recipients.length} recipients`);

  for (let globalIndex = 0; globalIndex < recipients.length; globalIndex++) {
    const recipient = recipients[globalIndex];
    const batchNumber = Math.floor(globalIndex / BATCH_SIZE) + 1;
    const isLastEmail = globalIndex === recipients.length - 1;

    try {
      // Personalize both subject and message
      const subject = personalizeTemplate(subjectTemplate, recipient);
      const personalizedMessage = personalizeTemplate(messageTemplate, recipient);

      console.log(`📤 [${globalIndex + 1}/${recipients.length}] Sending to: ${recipient.name} <${recipient.email}>`);
      console.log(`   Batch: ${batchNumber}, Subject: ${subject}`);

      await transporter.sendMail({
        from: `"${senderName}" <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        bcc: "info@innonsh.com",
        subject: subject,
        html: formatEmailBody(personalizedMessage),
        text: personalizedMessage
      });

      results.push({
        email: recipient.email,
        name: recipient.name,
        status: 'sent'
      });

      console.log(`✅ [${globalIndex + 1}/${recipients.length}] Sent to ${recipient.name} <${recipient.email}>`);

    } catch (error) {
      console.error(`❌ [${globalIndex + 1}/${recipients.length}] Failed to send to ${recipient.email}:`, error.message);
      console.error(`   Full error:`, error);

      results.push({
        email: recipient.email,
        name: recipient.name,
        status: 'failed',
        error: error.message
      });
    }

    // Add delay between emails (except last one)
    if (!isLastEmail) {
      console.log(`⏳ [${globalIndex + 1}/${recipients.length}] Waiting ${DELAY_MS}ms before next email...`);
      await sleep(DELAY_MS);
    } else {
      console.log(`🏁 Last email sent (${recipients.length} processed total)`);
    }
  }

  console.log(`✅ Email sending completed. Total processed: ${results.length}, Sent: ${results.filter(r => r.status === 'sent').length}, Failed: ${results.filter(r => r.status === 'failed').length}`);
  return results;
};

/**
 * Format email body as HTML
 */
const formatEmailBody = (text) => {
  // Convert newlines to <br> and wrap in basic HTML
  const htmlText = text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .content {
          white-space: pre-line;
        }
      </style>
    </head>
    <body>
      <div class="content">${htmlText}</div>
    </body>
    </html>
  `;
};

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
