import Problem from '../models/Problem.js';
import Company from '../models/Company.js';
import { buildPagination } from '../utils/apiResponse.js';
import { slugify } from '../utils/slugify.js';

/**
 * Get all problems with filtering, searching, sorting, and pagination.
 */
export const getAllProblems = async (query) => {
  const {
    page = 1,
    limit = 20,
    difficulty,
    search,
    topic,
    company,
    sort = 'frequency',
    order = 'desc',
  } = query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(500, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    filter.difficulty = difficulty;
  }

  if (topic) {
    filter.topics = { $in: [topic] };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      ...(isNaN(Number(search)) ? [] : [{ leetcodeId: Number(search) }]),
    ];
  }

  if (company) {
    const companyDoc = await Company.findOne({ slug: company }).lean();
    if (companyDoc) {
      filter.companies = companyDoc._id;
    }
  }

  const allowedSortFields = ['frequency', 'difficulty', 'acceptanceRate', 'title', 'leetcodeId'];
  const sortField = allowedSortFields.includes(sort) ? sort : 'frequency';
  const sortOrder = order === 'asc' ? 1 : -1;
  const sortObj = { [sortField]: sortOrder };

  const [problems, total] = await Promise.all([
    Problem.find(filter)
      .select('-description')
      .populate('companies', 'name slug logo')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Problem.countDocuments(filter),
  ]);

  return { problems, pagination: buildPagination(pageNum, limitNum, total) };
};

/**
 * Get a single problem by MongoDB ID or leetcodeId.
 */
export const getProblemById = async (id) => {
  // Support both MongoDB ObjectId and leetcodeId (numeric)
  let problem;

  if (!isNaN(Number(id))) {
    problem = await Problem.findOne({ leetcodeId: Number(id) })
      .populate('companies', 'name slug logo')
      .lean();
  } else {
    problem = await Problem.findById(id)
      .populate('companies', 'name slug logo')
      .lean();
  }

  if (!problem) {
    const error = new Error('Problem not found.');
    error.statusCode = 404;
    error.code = 'PROBLEM_NOT_FOUND';
    throw error;
  }

  return problem;
};

/**
 * Get all companies associated with a problem.
 */
export const getProblemCompanies = async (id) => {
  const problem = await getProblemById(id);
  return problem.companies;
};

/**
 * Create a new problem (admin).
 * Also updates totalProblems counter on associated companies.
 */
export const createProblem = async (data) => {
  const problem = await Problem.create(data);

  // Increment totalProblems on each associated company
  if (problem.companies && problem.companies.length > 0) {
    await Company.updateMany(
      { _id: { $in: problem.companies } },
      { $inc: { totalProblems: 1 } }
    );
  }

  return problem;
};

/**
 * Update a problem by ID (admin).
 * Recalculates company totalProblems if companies changed.
 */
export const updateProblem = async (id, data) => {
  const existing = await Problem.findById(id);
  if (!existing) {
    const error = new Error('Problem not found.');
    error.statusCode = 404;
    error.code = 'PROBLEM_NOT_FOUND';
    throw error;
  }

  // Handle company array changes
  if (data.companies) {
    const oldCompanyIds = existing.companies.map(String);
    const newCompanyIds = data.companies.map(String);

    const removed = oldCompanyIds.filter((c) => !newCompanyIds.includes(c));
    const added = newCompanyIds.filter((c) => !oldCompanyIds.includes(c));

    if (removed.length > 0) {
      await Company.updateMany({ _id: { $in: removed } }, { $inc: { totalProblems: -1 } });
    }
    if (added.length > 0) {
      await Company.updateMany({ _id: { $in: added } }, { $inc: { totalProblems: 1 } });
    }
  }

  const problem = await Problem.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('companies', 'name slug logo');

  return problem;
};

/**
 * Delete a problem by ID (admin).
 */
export const deleteProblem = async (id) => {
  const problem = await Problem.findById(id);
  if (!problem) {
    const error = new Error('Problem not found.');
    error.statusCode = 404;
    error.code = 'PROBLEM_NOT_FOUND';
    throw error;
  }

  // Decrement totalProblems for each associated company
  if (problem.companies && problem.companies.length > 0) {
    await Company.updateMany(
      { _id: { $in: problem.companies } },
      { $inc: { totalProblems: -1 } }
    );
  }

  await problem.deleteOne();
  return problem;
};

/**
 * Bulk import problems (from CSV or JSON array).
 * Flexibly handles headers like: ID, Title, Acceptance, Difficulty, Frequency, Leetcode Question Link, Company, Topics
 * Supports targetCompany override to import sheets under a specific company.
 * Optimised with MongoDB bulkWrite to process 400+ rows in milliseconds.
 */
export const bulkImportProblems = async (problemsData, targetCompany = null) => {
  let createdCount = 0;
  let updatedCount = 0;
  const errors = [];
  const companyCache = new Map();
  const seenLeetcodeIds = new Set();

  // Helper for flexible case-insensitive and variant field extraction
  const getVal = (row, ...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
        return row[k];
      }
      const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const rK of Object.keys(row)) {
        if (rK.toLowerCase().replace(/[^a-z0-9]/g, '') === normK) {
          if (row[rK] !== undefined && row[rK] !== null && String(row[rK]).trim() !== '') {
            return row[rK];
          }
        }
      }
    }
    return undefined;
  };

  // Helper to parse numeric values (handles strings like "47.8%", "95.2 %")
  const parseNum = (val, defaultVal = 0) => {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
    const cleaned = String(val).replace('%', '').replace(/[^0-9.]/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? defaultVal : num;
  };

  // Pre-load existing companies
  const existingCompanies = await Company.find().lean();
  existingCompanies.forEach((c) => {
    companyCache.set(c.name.toLowerCase().trim(), c._id);
    companyCache.set(c.slug, c._id);
  });

  const getOrCreateCompanyId = async (companyName) => {
    const trimmed = companyName.trim();
    if (!trimmed) return null;
    const key = trimmed.toLowerCase();

    if (companyCache.has(key)) {
      return companyCache.get(key);
    }

    try {
      const newComp = await Company.create({ name: trimmed });
      companyCache.set(key, newComp._id);
      companyCache.set(newComp.slug, newComp._id);
      return newComp._id;
    } catch {
      const found = await Company.findOne({ name: new RegExp(`^${trimmed}$`, 'i') });
      if (found) {
        companyCache.set(key, found._id);
        return found._id;
      }
      return null;
    }
  };

  // Target company resolution
  let defaultCompanyId = null;
  if (targetCompany && typeof targetCompany === 'string' && targetCompany.trim()) {
    defaultCompanyId = await getOrCreateCompanyId(targetCompany.trim());
  }

  // Pre-fetch all existing problem IDs for fast map lookup
  const existingProblems = await Problem.find({}, { _id: 1, leetcodeId: 1 }).lean();
  const existingMap = new Map(existingProblems.map((p) => [p.leetcodeId, p._id]));

  const bulkOps = [];

  for (let i = 0; i < problemsData.length; i++) {
    const item = problemsData[i];
    const rowNum = i + 2; // Account for CSV header row

    try {
      // Flexible extraction matching
      const rawId = getVal(item, 'ID', 'leetcodeId', 'Leetcode ID', 'Question ID', 'Problem ID', 'id', 'S.No', 'S. No.', 'No', '#');
      const rawTitle = getVal(item, 'Title', 'title', 'Question Title', 'Problem Title', 'Problem Name', 'Question Name', 'Question', 'Name', 'name');

      if (!rawTitle || !String(rawTitle).trim()) {
        throw new Error('Problem title is required');
      }

      let leetcodeId = parseNum(rawId, 0);

      // Fallback if ID column is missing from CSV
      if (!leetcodeId) {
        const rawUrl = getVal(item, 'Leetcode Question Link', 'leetcodeUrl', 'Leetcode Link', 'Question Link', 'Url', 'Link');
        const urlMatch = rawUrl ? String(rawUrl).match(/\/problems\/(\d+)/) : null;
        if (urlMatch && urlMatch[1]) {
          leetcodeId = parseInt(urlMatch[1], 10);
        }
      }

      if (!leetcodeId) {
        throw new Error('LeetCode ID is required');
      }

      const title = String(rawTitle).trim();
      const rawDiff = getVal(item, 'Difficulty', 'difficulty', 'Diff', 'Level');

      if (!rawDiff || !String(rawDiff).trim()) {
        throw new Error('Difficulty is required');
      }

      // Validate and normalize difficulty
      const trimmedDiff = String(rawDiff).trim();
      let diff = null;
      if (['Easy', 'Medium', 'Hard'].includes(trimmedDiff)) {
        diff = trimmedDiff;
      } else {
        const d = trimmedDiff.toLowerCase();
        if (d.startsWith('e') || d === 'easy') diff = 'Easy';
        else if (d.startsWith('m') || d === 'medium' || d === 'moderate') diff = 'Medium';
        else if (d.startsWith('h') || d === 'hard') diff = 'Hard';
      }

      if (!diff) {
        throw new Error(`Invalid difficulty "${trimmedDiff}"`);
      }

      const rawAcc = getVal(item, 'Acceptance', 'acceptanceRate', 'Acceptance Rate', 'Acceptance %', 'Acc');
      const rawFreq = getVal(item, 'Frequency', 'frequency', 'Freq', 'Frequency %');
      const rawUrl = getVal(item, 'Leetcode Question Link', 'leetcodeUrl', 'Leetcode Link', 'Question Link', 'Problem Link', 'Url', 'Link', 'URL');
      const rawTopics = getVal(item, 'Topics', 'topics', 'Topic', 'topic', 'Tags', 'Category');
      const rawCompanies = getVal(item, 'Companies', 'companies', 'Company', 'company', 'Company Name', 'Target Company', 'Asked In');
      const rawDesc = getVal(item, 'Description', 'description', 'Desc');
      const rawSolUrl = getVal(item, 'Solution Link', 'solutionUrl', 'Solution Url');

      // Normalize topics
      let topicsList = [];
      if (Array.isArray(rawTopics)) {
        topicsList = rawTopics.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof rawTopics === 'string') {
        topicsList = rawTopics.split(/[,|]/).map((t) => t.trim()).filter(Boolean);
      }

      // Normalize companies
      let companyNames = [];
      if (Array.isArray(rawCompanies)) {
        companyNames = rawCompanies.map((c) => String(c).trim()).filter(Boolean);
      } else if (typeof rawCompanies === 'string') {
        companyNames = rawCompanies.split(/[,|]/).map((c) => c.trim()).filter(Boolean);
      }

      const companyIds = [];
      if (defaultCompanyId) {
        companyIds.push(defaultCompanyId);
      }

      for (const compName of companyNames) {
        const compId = await getOrCreateCompanyId(compName);
        if (compId && !companyIds.some((id) => String(id) === String(compId))) {
          companyIds.push(compId);
        }
      }

      const slugVal = slugify(title);

      let finalLeetcodeUrl = rawUrl ? String(rawUrl).trim() : null;
      if (!finalLeetcodeUrl) {
        finalLeetcodeUrl = `https://leetcode.com/problems/${slugVal}/`;
      }

      // If no company assigned, assign to default General company
      if (companyIds.length === 0) {
        const generalCompId = await getOrCreateCompanyId('General');
        if (generalCompId) {
          companyIds.push(generalCompId);
        }
      }

      const payload = {
        leetcodeId,
        title,
        slug: slugVal,
        difficulty: diff,
        acceptanceRate: Math.min(100, Math.max(0, parseNum(rawAcc, 50))),
        frequency: Math.min(100, Math.max(0, parseNum(rawFreq, 50))),
        leetcodeUrl: finalLeetcodeUrl,
        topics: topicsList,
        companies: companyIds,
        description: rawDesc ? String(rawDesc).trim() : null,
        solutionUrl: rawSolUrl ? String(rawSolUrl).trim() : null,
      };

      const existingId = existingMap.get(leetcodeId);
      if (existingId || seenLeetcodeIds.has(leetcodeId)) {
        bulkOps.push({
          updateOne: {
            filter: { leetcodeId },
            update: {
              $set: {
                title,
                slug: slugVal,
                difficulty: diff,
                acceptanceRate: payload.acceptanceRate,
                frequency: payload.frequency,
                leetcodeUrl: finalLeetcodeUrl,
                description: payload.description,
                solutionUrl: payload.solutionUrl,
              },
              $addToSet: {
                companies: { $each: companyIds },
                ...(topicsList.length > 0 ? { topics: { $each: topicsList } } : {})
              }
            },
          },
        });
        updatedCount++;
      } else {
        bulkOps.push({
          insertOne: {
            document: payload,
          },
        });
        seenLeetcodeIds.add(leetcodeId);
        createdCount++;
      }
    } catch (err) {
      errors.push({
        row: rowNum,
        error: err.message,
      });
    }
  }

  // Execute bulk operations
  if (bulkOps.length > 0) {
    await Problem.bulkWrite(bulkOps);
  }

  // Recalculate company problem counts
  const companyCounts = await Problem.aggregate([
    { $unwind: '$companies' },
    { $group: { _id: '$companies', count: { $sum: 1 } } },
  ]);

  await Company.updateMany({}, { totalProblems: 0 });
  if (companyCounts.length > 0) {
    const compBulkOps = companyCounts.map((c) => ({
      updateOne: {
        filter: { _id: c._id },
        update: { $set: { totalProblems: c.count } },
      },
    }));
    await Company.bulkWrite(compBulkOps);
  }

  return {
    totalRows: problemsData.length,
    successfulRows: createdCount + updatedCount,
    createdCount,
    updatedCount,
    failedRows: errors.length,
    errorsCount: errors.length,
    errors,
  };
};

