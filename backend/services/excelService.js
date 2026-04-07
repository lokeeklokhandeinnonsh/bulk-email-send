import XLSX from 'xlsx';

/**
 * Parse Excel/CSV file and extract recipient data
 * Expects columns: Name, Company, Email (case-insensitive)
 */
export const readExcelFile = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`📖 Reading Excel file from path: ${filePath}`);

      // Check if file exists
      if (!XLSX.readFile) {
        // Fallback for older xlsx versions
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
          reject(new Error(`File not found: ${filePath}`));
          return;
        }
      }

      // Read workbook from file path
      const workbook = XLSX.readFile(filePath);

      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (jsonData.length === 0) {
        reject(new Error('Excel file is empty'));
        return;
      }

      // Normalize column names (case-insensitive)
      const normalizedData = jsonData.map(row => {
        const lowerRow = {};
        Object.keys(row).forEach(key => {
          lowerRow[key.toLowerCase()] = row[key];
        });
        return lowerRow;
      });

      // Find column names (case-insensitive)
      const firstRow = normalizedData[0];
      const possibleNameCols = ['name', 'fullname', 'full name', 'recipient name'];
      const possibleCompanyCols = ['company', 'organization', 'firm', 'company name'];
      const possibleEmailCols = ['email', 'email address', 'e-mail', 'mail'];

      const nameCol = findColumn(possibleNameCols, firstRow);
      const companyCol = findColumn(possibleCompanyCols, firstRow);
      const emailCol = findColumn(possibleEmailCols, firstRow);

      if (!nameCol || !companyCol || !emailCol) {
        reject(new Error(
          `Required columns not found. Looking for: Name (found: ${nameCol}), Company (found: ${companyCol}), Email (found: ${emailCol})`
        ));
        return;
      }

      // Extract valid recipients
      const recipients = normalizedData
        .map(row => {
          const name = String(row[nameCol] || '').trim();
          const company = String(row[companyCol] || '').trim();
          const email = String(row[emailCol] || '').trim();

          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!name || !company || !email) {
            return null;
          }

          if (!emailRegex.test(email)) {
            console.warn(`⚠️ Invalid email format: ${email} - skipping`);
            return null;
          }

          return { name, company, email };
        })
        .filter(Boolean);

      console.log(`✅ Successfully parsed ${recipients.length} valid recipients`);
      resolve(recipients);

    } catch (error) {
      reject(new Error(`Failed to parse Excel file: ${error.message}`));
    }
  });
};

/**
 * Find matching column name from list of possibilities
 */
const findColumn = (possibleCols, row) => {
  for (const col of possibleCols) {
    if (row.hasOwnProperty(col.toLowerCase())) {
      return col;
    }
  }
  return null;
};
