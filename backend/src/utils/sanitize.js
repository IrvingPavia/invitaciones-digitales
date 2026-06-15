const sanitizeHtml = require('sanitize-html');

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Allows basic formatting tags but strips scripts and dangerous attributes.
 */
function sanitizeRichText(dirty) {
  if (!dirty || typeof dirty !== 'string') return dirty;
  return sanitizeHtml(dirty, {
    allowedTags: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4'],
    allowedAttributes: {
      'a': ['href', 'target', 'rel'],
      'span': ['style'],
      'p': ['style'],
    },
    allowedStyles: {
      '*': {
        'color': [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/, /^rgba\(/],
        'text-align': [/^left$/, /^right$/, /^center$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
        'font-weight': [/^\d+$/, /^bold$/, /^normal$/],
        'font-style': [/^italic$/, /^normal$/],
        'text-decoration': [/^underline$/, /^none$/],
      },
    },
    // Force all links to open in new tab and be safe
    transformTags: {
      'a': sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
  });
}

/**
 * Sanitize plain text (strip ALL HTML tags).
 * For fields like names, titles, etc.
 */
function sanitizePlainText(dirty) {
  if (!dirty || typeof dirty !== 'string') return dirty;
  return sanitizeHtml(dirty, { allowedTags: [], allowedAttributes: {} });
}

/**
 * Deep sanitize an object's string values.
 * Used for config JSON which may contain user-provided text.
 * Only sanitizes string values that look like they could contain HTML.
 */
function sanitizeConfigJson(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => sanitizeConfigJson(item));

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Only sanitize text content fields, not URLs/colors/fonts
      if (isTextContentField(key) && containsHtml(value)) {
        result[key] = sanitizeRichText(value);
      } else {
        result[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeConfigJson(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/** Fields that can contain user text (potential XSS vectors) */
function isTextContentField(key) {
  const textFields = [
    'title', 'subtitle', 'description', 'text', 'phrase', 'instructionText',
    'sealText', 'buttonText', 'heroPhrase', 'eventDescription', 'celebrantNames',
    'accountName', 'bank', 'accountNumber', 'admin_note', 'notes',
    'label', 'name',
  ];
  return textFields.includes(key);
}

/** Quick check if a string contains HTML-like content */
function containsHtml(str) {
  return /<[a-z/][\s\S]*>/i.test(str);
}

module.exports = { sanitizeRichText, sanitizePlainText, sanitizeConfigJson };
