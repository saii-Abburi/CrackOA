import Company from '../models/Company.js';
import Problem from '../models/Problem.js';
import { buildPagination } from '../utils/apiResponse.js';

/**
 * Get all companies, sorted alphabetically.
 */
export const getAllCompanies = async () => {
  return Company.find().sort({ name: 1 }).lean();
};

/**
 * Get a single company by slug.
 */
export const getCompanyBySlug = async (slug) => {
  const company = await Company.findOne({ slug }).lean();
  if (!company) {
    const error = new Error(`Company '${slug}' not found.`);
    error.statusCode = 404;
    error.code = 'COMPANY_NOT_FOUND';
    throw error;
  }
  return company;
};

/**
 * Get paginated problems for a company with filtering & sorting.
 */
export const getCompanyProblems = async (slug, query) => {
  // Resolve company first
  const company = await Company.findOne({ slug }).lean();
  if (!company) {
    const error = new Error(`Company '${slug}' not found.`);
    error.statusCode = 404;
    error.code = 'COMPANY_NOT_FOUND';
    throw error;
  }

  const {
    page = 1,
    limit = 0,
    difficulty,
    search,
    topic,
    sort = 'frequency',
    order = 'desc',
  } = query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = parseInt(limit) || 0; // 0 means no limit
  const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

  // Build filter
  const filter = { companies: company._id };

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

  // Build sort
  const allowedSortFields = ['frequency', 'difficulty', 'acceptanceRate', 'title', 'leetcodeId'];
  const sortField = allowedSortFields.includes(sort) ? sort : 'frequency';
  const sortOrder = order === 'asc' ? 1 : -1;
  const sortObj = { [sortField]: sortOrder };

  let dbQuery = Problem.find(filter)
    .select('-description')
    .populate('companies', 'name slug logo')
    .sort(sortObj);

  if (limitNum > 0) {
    dbQuery = dbQuery.skip(skip).limit(limitNum);
  }

  const [problems, total] = await Promise.all([
    dbQuery.lean(),
    Problem.countDocuments(filter),
  ]);

  return {
    problems,
    company,
    pagination: buildPagination(pageNum, limitNum || total, total),
  };
};

/**
 * Create a new company (admin).
 */
export const createCompany = async (data) => {
  const company = await Company.create(data);
  return company;
};

/**
 * Update a company by ID (admin).
 */
export const updateCompany = async (id, data) => {
  const company = await Company.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!company) {
    const error = new Error('Company not found.');
    error.statusCode = 404;
    error.code = 'COMPANY_NOT_FOUND';
    throw error;
  }
  return company;
};

/**
 * Delete a company by ID (admin).
 */
export const deleteCompany = async (id) => {
  const company = await Company.findByIdAndDelete(id);
  if (!company) {
    const error = new Error('Company not found.');
    error.statusCode = 404;
    error.code = 'COMPANY_NOT_FOUND';
    throw error;
  }
  return company;
};
