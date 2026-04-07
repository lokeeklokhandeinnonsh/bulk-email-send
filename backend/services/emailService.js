import nodemailer from 'nodemailer';
import { personalizeTemplate } from '../utils/personalize.js';

/**
 * Send emails in batches with delay between each email
 */
export const sendEmails = async (recipients, subjectTemplate, messageTemplate) => {
  const results = [];
  const BATCH_SIZE = 50;
  const DELAY_MS = 1500; // 1.5 seconds between emails

  // Sender configuration
  const senderName = "Lokeek Lokhande";

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
    rateLimit: 2
  });

  // Verify connection
  try {
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

  // Process recipients in batches
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${
      Math.ceil(recipients.length / BATCH_SIZE)
    } (${batch.length} emails)`);

    for (const recipient of batch) {
      try {
        // Personalize both subject and message
        const subject = personalizeTemplate(subjectTemplate, recipient);
        const personalizedMessage = personalizeTemplate(messageTemplate, recipient);

        console.log(`📤 Sending to: ${recipient.name} <${recipient.email}>`);
        console.log(`   Subject: ${subject}`);

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

        console.log(`✅ Sent to ${recipient.name} <${recipient.email}>`);

      } catch (error) {
        console.error(`❌ Failed to send to ${recipient.email}:`, error.message);

        results.push({
          email: recipient.email,
          name: recipient.name,
          status: 'failed',
          error: error.message
        });
      }

      // Add delay between emails (except last one)
      if (i + batch.indexOf(recipient) < recipients.length - 1) {
        await sleep(DELAY_MS);
      }
    }
  }

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
