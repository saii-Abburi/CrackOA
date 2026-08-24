import { slugify } from '../utils/slugify.js';

/**
 * Extract clean LeetCode title slug from URL, title, or slug string
 * @param {string|number} input 
 * @returns {string}
 */
export const extractSlugFromInput = (input) => {
  if (!input) return '';
  const strInput = String(input).trim();
  
  // If it's a full LeetCode URL e.g. https://leetcode.com/problems/two-sum/
  const urlMatch = strInput.match(/\/problems\/([a-z0-9-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].toLowerCase();
  }

  // Otherwise slugify title or raw slug
  return slugify(strInput);
};

/**
 * Fetch detailed problem data directly from LeetCode GraphQL API
 * @param {string} titleSlugOrUrl 
 * @returns {Promise<Object>} Formatted problem details
 */
export const fetchLeetCodeQuestionDetails = async (titleSlugOrUrl) => {
  const titleSlug = extractSlugFromInput(titleSlugOrUrl);

  if (!titleSlug) {
    const error = new Error('Invalid LeetCode problem title or slug.');
    error.statusCode = 400;
    error.code = 'INVALID_LEETCODE_SLUG';
    throw error;
  }

  const query = `
    query getQuestionDetails($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        content
        difficulty
        stats
        topicTags {
          name
          slug
        }
        codeSnippets {
          lang
          langSlug
          code
        }
        hints
        sampleTestCase
        exampleTestcases
      }
    }
  `;

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug }
      })
    });

    if (!response.ok) {
      throw new Error(`LeetCode API returned status ${response.status}`);
    }

    const resData = await response.json();

    if (resData.errors && resData.errors.length > 0) {
      throw new Error(resData.errors[0].message || 'LeetCode GraphQL error');
    }

    const question = resData.data?.question;
    if (!question) {
      const error = new Error(`Problem "${titleSlug}" not found on LeetCode.`);
      error.statusCode = 404;
      error.code = 'LEETCODE_PROBLEM_NOT_FOUND';
      throw error;
    }

    // Parse stats JSON string from LeetCode
    let parsedStats = { totalAccepted: '', totalSubmission: '', acRate: '' };
    if (question.stats) {
      try {
        parsedStats = JSON.parse(question.stats);
      } catch (e) {
        console.warn('Failed to parse LeetCode stats string:', e);
      }
    }

    // Parse numeric acceptance rate
    let acceptanceRate = 0;
    if (parsedStats.acRate) {
      const cleanedAc = String(parsedStats.acRate).replace('%', '').trim();
      acceptanceRate = parseFloat(cleanedAc) || 0;
    }

    const leetcodeId = parseInt(question.questionFrontendId || question.questionId, 10);
    const topics = Array.isArray(question.topicTags) 
      ? question.topicTags.map((tag) => tag.name) 
      : [];

    return {
      leetcodeId: isNaN(leetcodeId) ? null : leetcodeId,
      title: question.title,
      slug: question.titleSlug,
      difficulty: question.difficulty || 'Medium',
      acceptanceRate,
      description: question.content || '',
      topics,
      codeSnippets: question.codeSnippets || [],
      hints: question.hints || [],
      sampleTestCase: question.sampleTestCase || '',
      leetcodeUrl: `https://leetcode.com/problems/${question.titleSlug}/`,
      stats: {
        totalAccepted: parsedStats.totalAccepted || '',
        totalSubmission: parsedStats.totalSubmission || '',
        acRate: parsedStats.acRate || `${acceptanceRate}%`
      }
    };
  } catch (err) {
    if (err.statusCode) throw err;

    const error = new Error(`Failed to fetch from LeetCode: ${err.message}`);
    error.statusCode = 502;
    error.code = 'LEETCODE_FETCH_FAILED';
    throw error;
  }
};
