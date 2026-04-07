/**
 * Personalize template strings by replacing placeholders with actual data
 * Supports: {{name}}, {{company}}
 *
 * @param {string} template - The template string with placeholders
 * @param {Object} data - The recipient data object
 * @returns {string} - Personalized string
 */
export const personalizeTemplate = (template, data) => {
  if (!template || typeof template !== 'string') {
    return '';
  }

  let result = template;

  // Replace {{name}} - fallback to "Sir/Madam" if missing
  result = result.replace(/\{\{name\}\}/gi, data.Name || data.name || 'Sir/Madam');

  // Replace {{company}} - fallback to empty string if missing
  result = result.replace(/\{\{company\}\}/gi, data.Company || data.company || '');

  return result;
};

/**
 * Extract first name from full name
 * @param {string} fullName
 * @returns {string}
 */
const extractFirstName = (fullName) => {
  if (!fullName) return 'there';

  // Split by space and take first part
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || 'there';
};

/**
 * Validate that template has no remaining unprocessed placeholders
 * @param {string} template
 * @returns {Array<string>} - Array of unresolved placeholders
 */
export const getUnresolvedPlaceholders = (template) => {
  if (!template) return [];

  const placeholders = template.match(/\{\{[^}]+\}\}/g);
  const supported = ['name', 'company', 'email', 'firstName'];

  if (!placeholders) return [];

  return placeholders.filter(ph => {
    const key = ph.match(/\{\{([^}]+)\}\}/)?.[1]?.toLowerCase();
    return key && !supported.includes(key);
  });
};
