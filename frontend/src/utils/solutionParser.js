/**
 * parseSolutionMarkdown
 * Parses a single Markdown solution document (LeetCode editorial style)
 * into structured fields: problemStatement, intuition, approach, timeComplexity, spaceComplexity, code, codeLanguage.
 */
export function parseSolutionMarkdown(rawMarkdown) {
  if (!rawMarkdown || typeof rawMarkdown !== 'string') {
    return {
      excerpt: '',
      intuition: '',
      approach: '',
      timeComplexity: '',
      spaceComplexity: '',
      code: '',
      codeLanguage: 'cpp',
    };
  }

  // Remove HTML comments (e.g. <!-- comments -->)
  const cleanDoc = rawMarkdown.replace(/<!--[\s\S]*?-->/g, '').trim();

  // Split into sections by top-level headings (# or ##)
  const sectionRegex = /(?:^|\n)(#{1,3})\s+([^\n]+)\n/g;
  let matches = [];
  let match;

  while ((match = sectionRegex.exec(cleanDoc)) !== null) {
    matches.push({
      heading: match[2].trim().toLowerCase(),
      rawHeading: match[2].trim(),
      index: match.index + match[0].length,
      fullIndex: match.index,
    });
  }

  let problemStatement = '';
  let intuition = '';
  let approach = '';
  let complexityRaw = '';
  let code = '';
  let codeLanguage = 'cpp';

  if (matches.length === 0) {
    // No headings found - check for code block and treat rest as approach/intuition
    const codeMatch = cleanDoc.match(/```([a-zA-Z0-9+#_-]*)\n([\s\S]*?)```/);
    if (codeMatch) {
      codeLanguage = normalizeLanguage(codeMatch[1]);
      code = codeMatch[2].trim();
      approach = cleanDoc.replace(codeMatch[0], '').trim();
    } else {
      approach = cleanDoc;
    }
  } else {
    // Text before first heading (if any) is problem statement / intro
    if (matches[0].fullIndex > 0) {
      problemStatement = cleanDoc.slice(0, matches[0].fullIndex).trim();
    }

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex = i + 1 < matches.length ? matches[i + 1].fullIndex : cleanDoc.length;
      const sectionContent = cleanDoc.slice(current.index, nextIndex).trim();
      const h = current.heading;

      if (h.includes('intuition') || h.includes('overview') || h.includes('idea') || h.includes('thought')) {
        intuition = sectionContent;
      } else if (h.includes('approach') || h.includes('algorithm') || h.includes('method') || h.includes('solution') || h.includes('step')) {
        approach = sectionContent;
      } else if (h.includes('complexity') || h.includes('time') || h.includes('space')) {
        complexityRaw += '\n' + sectionContent;
      } else if (h.includes('code') || h.includes('implementation') || h.includes('program')) {
        // Extract code block inside this section
        const codeBlockMatch = sectionContent.match(/```([a-zA-Z0-9+#_-]*)\n([\s\S]*?)```/);
        if (codeBlockMatch) {
          codeLanguage = normalizeLanguage(codeBlockMatch[1]);
          code = codeBlockMatch[2].trim();
        } else {
          // If no fences, could be raw code or inline
          code = sectionContent;
        }
      } else if (h.includes('problem') || h.includes('statement') || h.includes('description')) {
        problemStatement = sectionContent;
      } else {
        // Unrecognized section - append to approach
        approach += (approach ? '\n\n' : '') + `### ${current.rawHeading}\n\n` + sectionContent;
      }
    }
  }

  // Parse time & space complexity from complexityRaw (or full document if missing)
  const complexitySearchText = complexityRaw || cleanDoc;
  let timeComplexity = '';
  let spaceComplexity = '';

  const timeMatch = complexitySearchText.match(/(?:time\s*complexity|time)[\s*:]+([^\n]+)/i);
  if (timeMatch) {
    timeComplexity = cleanComplexityString(timeMatch[1]);
  }

  const spaceMatch = complexitySearchText.match(/(?:space\s*complexity|space)[\s*:]+([^\n]+)/i);
  if (spaceMatch) {
    spaceComplexity = cleanComplexityString(spaceMatch[1]);
  }

  // If code was not found under # Code, search the entire document for any fenced code block
  if (!code) {
    const globalCodeMatch = cleanDoc.match(/```([a-zA-Z0-9+#_-]*)\n([\s\S]*?)```/);
    if (globalCodeMatch) {
      codeLanguage = normalizeLanguage(globalCodeMatch[1]);
      code = globalCodeMatch[2].trim();
    }
  }

  return {
    excerpt: problemStatement || (intuition ? intuition.slice(0, 200) : ''),
    intuition,
    approach,
    timeComplexity: timeComplexity || 'O(n)',
    spaceComplexity: spaceComplexity || 'O(1)',
    code,
    codeLanguage: codeLanguage || 'cpp',
  };
}

function cleanComplexityString(str) {
  if (!str) return '';
  return str
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[`*$]/g, '')
    .replace(/\\mathcal\{O\}/gi, 'O')
    .replace(/\\mathcal\{([^}]+)\}/g, '$1')
    .replace(/^[:\s\-•]+/, '')
    .replace(/[;.]+$/, '')
    .trim();
}

function normalizeLanguage(lang) {
  if (!lang) return 'python';
  const l = lang.toLowerCase().trim();
  if (l === 'c++' || l === 'cpp') return 'cpp';
  if (l === 'py' || l === 'python' || l === 'python3') return 'python';
  if (l === 'js' || l === 'javascript') return 'javascript';
  if (l === 'ts' || l === 'typescript') return 'typescript';
  if (l === 'java') return 'java';
  if (l === 'golang' || l === 'go') return 'go';
  if (l === 'rs' || l === 'rust') return 'rust';
  if (l === 'cs' || l === 'c#' || l === 'csharp') return 'csharp';
  if (l === 'sql') return 'sql';
  return l;
}

/**
 * buildSolutionMarkdown
 * Inverse of parseSolutionMarkdown — reconstructs the single markdown string from existing structured fields
 */
export function buildSolutionMarkdown(blog) {
  if (!blog) return DEFAULT_LEETCODE_TEMPLATE;

  // If the blog already has raw markdown or only one content field
  if (blog.rawMarkdown) return blog.rawMarkdown;

  const parts = [];

  if (blog.excerpt && blog.excerpt !== blog.intuition?.slice(0, 200)) {
    parts.push(`# Problem\n\n${blog.excerpt}`);
  }

  if (blog.intuition) {
    parts.push(`# Intuition\n\n${blog.intuition}`);
  }

  if (blog.approach) {
    parts.push(`# Approach\n\n${blog.approach}`);
  }

  if (blog.timeComplexity || blog.spaceComplexity) {
    const time = blog.timeComplexity || 'O(n)';
    const space = blog.spaceComplexity || 'O(1)';
    parts.push(`# Complexity\n\n- Time complexity: ${time}\n- Space complexity: ${space}`);
  }

  if (blog.code) {
    const lang = blog.codeLanguage || 'python';
    parts.push(`# Code\n\n\`\`\`${lang}\n${blog.code}\n\`\`\``);
  }

  return parts.length > 0 ? parts.join('\n\n') : DEFAULT_LEETCODE_TEMPLATE;
}

export const DEFAULT_LEETCODE_TEMPLATE = `# Intuition
<!-- Describe your first thoughts on how to solve this problem. -->

# Approach
<!-- Describe your approach to solving the problem. -->

# Complexity
- Time complexity:
<!-- Add your time complexity here, e.g. O(n) or O(n log n) -->

- Space complexity:
<!-- Add your space complexity here, e.g. O(1) or O(n) -->

# Code
\`\`\`python
class Solution:
    def solve(self, nums: List[int]) -> int:
        pass
\`\`\``;
