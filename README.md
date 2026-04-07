# Cold Mail Sender Tool

A full-stack web application for sending personalized bulk emails using Gmail SMTP. Upload an Excel/CSV file with contacts, craft your message with placeholders, and send emails in controlled batches.

---

## Features

- Excel/CSV file upload with column validation (Name, Company, Email)
- Message personalization with `{{name}}` and `{{company}}` placeholders
- Batch sending (50 emails per batch) with rate limiting
- Real-time progress tracking and status logs
- Clean, responsive UI with Tailwind CSS
- Error handling and detailed logging
- Gmail SMTP integration via Nodemailer

---

## Tech Stack

**Backend:**
- Node.js + Express
- Nodemailer (Gmail SMTP)
- Multer (file uploads)
- XLSX (Excel parsing)
- Rate limiting

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Axios

---

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Gmail account** with 2-factor authentication enabled
3. **Gmail App Password** (see setup below)

---

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd bulk-email

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend

```bash
# Copy environment file
cd backend
cp .env.example .env
```

Edit `.env` with your Gmail credentials:

```env
PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Enable **2-Step Verification** (if not already enabled)
3. Navigate to **Security** → **App passwords**
4. Select **Mail** for app, **Other (Custom name)** for device
5. Copy the 16-character password generated
6. Use this as `EMAIL_PASS` in your `.env` file

⚠️ **Note:** Do NOT use your regular Gmail password. Use an App Password.

### 4. Prepare Your Contact File

Create an Excel file (`.xlsx`, `.xls`) or CSV with these exact column headers (case-insensitive):

| Name    | Company     | Email              |
|---------|-------------|--------------------|
| John    | Acme Corp   | john@acme.com      |
| Jane    | Tech Inc    | jane@tech.com      |

---

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend

```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

Open browser to `http://localhost:5173`

---

## Usage

1. **Upload your contact file** (Excel/CSV)
2. **Enter email subject**
3. **Compose your message** using:
   - `{{name}}` → replaced with recipient's name
   - `{{company}}` → replaced with recipient's company

   Example:
   ```
   Hi {{name}},

   I'm reaching out about {{company}}. Would you be interested in our product?

   Best,
   Your Name
   ```

4. **Click "Send Emails"**
5. Watch real-time progress and logs

---

## Project Structure

```
bulk-email/
├── backend/
│   ├── server.js              # Express server
│   ├── routes/
│   │   └── emailRoutes.js     # API routes
│   ├── controllers/
│   │   └── emailController.js # Request handler
│   ├── services/
│   │   ├── emailService.js    # Email sending logic
│   │   └── excelService.js    # Excel parsing
│   ├── middleware/
│   │   └── uploadMiddleware.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadForm.jsx
│   │   │   └── StatusLog.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## API Reference

### POST `/api/send-emails`

**Request:** `multipart/form-data`

| Field   | Type   | Required | Description                     |
|---------|--------|----------|---------------------------------|
| file    | File   | Yes      | Excel (.xlsx, .xls) or CSV     |
| subject | string | Yes      | Email subject                  |
| message | string | Yes      | Message with placeholders      |

**Response:**

```json
{
  "success": true,
  "sent": 10,
  "failed": 0,
  "total": 10,
  "logs": [
    {
      "email": "john@example.com",
      "name": "John",
      "status": "sent"
    }
  ]
}
```

---

## Configuration

### Backend Environment Variables

| Variable                   | Default              | Description                       |
|----------------------------|----------------------|-----------------------------------|
| `PORT`                     | 5000                 | Server port                       |
| `EMAIL_USER`               | required             | Gmail address                     |
| `EMAIL_PASS`               | required             | Gmail app password                |
| `NODE_ENV`                 | development          | Environment mode                  |
| `RATE_LIMIT_WINDOW_MS`     | 15 minutes           | Rate limit window                 |
| `RATE_LIMIT_MAX_REQUESTS`  | 10                   | Max requests per window           |
| `ALLOWED_ORIGINS`          | localhost:5173/3000  | CORS allowed origins (comma-sep)  |

---

## Troubleshooting

### Authentication failed
- Verify you're using an **App Password**, not your regular Gmail password
- Ensure 2-Step Verification is enabled on your Google Account
- Check that `EMAIL_USER` matches your Gmail address

### File upload errors
- Ensure file is `.xlsx`, `.xls`, or `.csv`
- Check file size (max 10MB)
- Verify columns exist: Name, Company, Email (case-insensitive)

### CORS errors
- Add your frontend origin to `ALLOWED_ORIGINS` in `.env`
- Restart server after changing `.env`

---

## Production Deployment

### Security Considerations

1. Use strong app passwords and rotate regularly
2. Enable CORS only for your domain
3. Add authentication to the API
4. Use HTTPS
5. Set up email sending limits to avoid being flagged as spam

### Environment

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourfrontend.com
```

---

## License

MIT

---

## Support

For issues or questions, please open an issue on GitHub.
