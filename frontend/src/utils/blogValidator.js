/**
 * Validation utility for Educational DSA Editorial Blog Document Architecture
 */

export const SUPPORTED_LANGUAGES = [
  'cpp',
  'c++',
  'java',
  'python',
  'py',
  'javascript',
  'js',
  'typescript',
  'ts',
  'csharp',
  'cs',
  'go',
  'rust',
  'sql',
];

export function validateBlogDocument(blogPayload) {
  const errors = [];

  if (!blogPayload) {
    return { valid: false, errors: ['Blog data is missing'] };
  }

  // Required Metadata
  if (!blogPayload.title || typeof blogPayload.title !== 'string' || !blogPayload.title.trim()) {
    errors.push('Title is required');
  }

  if (!blogPayload.slug || typeof blogPayload.slug !== 'string' || !blogPayload.slug.trim()) {
    errors.push('Slug is required');
  }

  if (!blogPayload.problem && !blogPayload.problemId) {
    errors.push('Associated LeetCode Problem is required');
  }

  if (!blogPayload.excerpt || typeof blogPayload.excerpt !== 'string' || !blogPayload.excerpt.trim()) {
    errors.push('Summary / Excerpt is required');
  }

  const content = blogPayload.content;
  if (!content) {
    errors.push('Blog content is required');
    return { valid: false, errors };
  }

  // Check if content is structured DSA document model or legacy sections
  const hasStructuredApproaches = Array.isArray(content.approaches) && content.approaches.length > 0;
  const hasLegacySections = Array.isArray(content.sections) && content.sections.length > 0;
  const hasRawMarkdown = typeof content.markdown === 'string' || typeof content === 'string';

  if (!hasStructuredApproaches && !hasLegacySections && !hasRawMarkdown) {
    errors.push('At least one approach or content section is required');
  }

  // Validate Structured Approaches if present
  if (hasStructuredApproaches) {
    content.approaches.forEach((app, idx) => {
      const num = idx + 1;
      if (!app.title || !app.title.trim()) {
        errors.push(`Approach #${num} is missing a title`);
      }

      if (!app.intuition && (!app.algorithm || app.algorithm.length === 0) && !app.code) {
        errors.push(`Approach #${num} (${app.title || 'Untitled'}) must contain intuition, algorithm, or code`);
      }

      // Validate Code object if present
      if (app.code && typeof app.code === 'object') {
        const langKeys = Object.keys(app.code);
        langKeys.forEach((lang) => {
          if (!SUPPORTED_LANGUAGES.includes(lang.toLowerCase())) {
            errors.push(`Approach #${num} contains unsupported language '${lang}'`);
          }
          if (typeof app.code[lang] !== 'string' || app.code[lang].trim().length === 0) {
            errors.push(`Approach #${num} has empty code for language '${lang}'`);
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
