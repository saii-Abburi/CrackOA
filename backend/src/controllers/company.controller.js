import * as companyService from '../services/company.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * GET /api/companies
 */
export const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.getAllCompanies();
    return sendSuccess(res, 200, 'Companies fetched successfully.', companies);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/companies/:slug
 */
export const getCompany = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyBySlug(req.params.slug);
    return sendSuccess(res, 200, 'Company fetched successfully.', company);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/companies/:slug/problems
 */
export const getCompanyProblems = async (req, res, next) => {
  try {
    const { problems, company, pagination } = await companyService.getCompanyProblems(
      req.params.slug,
      req.query
    );
    return sendSuccess(res, 200, 'Company problems fetched successfully.', problems, {
      company: { name: company.name, slug: company.slug },
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/companies
 */
export const createCompany = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.body);
    return sendSuccess(res, 201, 'Company created successfully.', company);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/companies/:id
 */
export const updateCompany = async (req, res, next) => {
  try {
    const company = await companyService.updateCompany(req.params.id, req.body);
    return sendSuccess(res, 200, 'Company updated successfully.', company);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/companies/:id
 */
export const deleteCompany = async (req, res, next) => {
  try {
    await companyService.deleteCompany(req.params.id);
    return sendSuccess(res, 200, 'Company deleted successfully.', null);
  } catch (error) {
    next(error);
  }
};
