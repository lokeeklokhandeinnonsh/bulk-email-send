/**
 * Middleware to validate uploaded Excel file
 */
export const validateExcelFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  const { size, mimetype, originalname } = req.file;

  // Check file size (10MB max)
  if (size > 10 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      error: 'File size too large. Maximum 10MB allowed.'
    });
  }

  // Check file type
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];

  const allowedExtensions = ['.xlsx', '.xls', '.csv'];

  const isValidMimeType = allowedMimeTypes.includes(mimetype);
  const isValidExtension = allowedExtensions.some(ext =>
    originalname.toLowerCase().endsWith(ext)
  );

  if (!isValidMimeType && !isValidExtension) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'
    });
  }

  next();
};
