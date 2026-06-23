export function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      for (const rule of rules) {
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field} is required`);
          break;
        }
        if (value !== undefined && value !== null) {
          if (rule.minLength && String(value).length < rule.minLength) {
            errors.push(`${field} must be at least ${rule.minLength} characters`);
          }
          if (rule.maxLength && String(value).length > rule.maxLength) {
            errors.push(`${field} must be at most ${rule.maxLength} characters`);
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${field} format is invalid`);
          }
        }
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    next();
  };
}
