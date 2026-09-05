/**
 * Repository Interfaces
 *
 * Base "interface" classes for the Repository pattern. Each method throws
 * 'Not implemented' by default. Concrete repositories (e.g. Mongo*Repository)
 * extend these and provide real implementations.
 *
 * Services depend on these interfaces, NOT on Mongoose models directly.
 * This lets us swap in-memory / Postgres / any storage later without
 * touching business logic.
 */

// ─────────────────────────────────────────────────────────────────────────────
// IProblemRepository
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @abstract
 */
export class IProblemRepository {
  /**
   * Find a problem by its MongoDB ID, leetcodeId, or slug.
   * @param {string|number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('IProblemRepository.findById() not implemented');
  }

  /**
   * Find all problems matching a filter, with sorting and pagination.
   * @param {Object} filter   - Query filter object
   * @param {Object} sort     - Sort specification
   * @param {Object} pagination - { page, limit }
   * @returns {Promise<{ problems: Object[], total: number }>}
   */
  async findAll(filter = {}, sort = {}, pagination = {}) {
    throw new Error('IProblemRepository.findAll() not implemented');
  }

  /**
   * Find problems belonging to a specific company.
   * @param {string} companyId
   * @param {Object} filter
   * @param {Object} sort
   * @param {Object} pagination
   * @returns {Promise<{ problems: Object[], total: number }>}
   */
  async findByCompany(companyId, filter = {}, sort = {}, pagination = {}) {
    throw new Error('IProblemRepository.findByCompany() not implemented');
  }

  /**
   * Persist a problem (create or update).
   * @param {Object} problem
   * @returns {Promise<Object>}
   */
  async save(problem) {
    throw new Error('IProblemRepository.save() not implemented');
  }

  /**
   * Delete a problem by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    throw new Error('IProblemRepository.delete() not implemented');
  }

  /**
   * Count problems matching a filter.
   * @param {Object} filter
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    throw new Error('IProblemRepository.count() not implemented');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ICompanyRepository
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @abstract
 */
export class ICompanyRepository {
  /**
   * Find a company by its MongoDB ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('ICompanyRepository.findById() not implemented');
  }

  /**
   * Find a company by its URL slug.
   * @param {string} slug
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug) {
    throw new Error('ICompanyRepository.findBySlug() not implemented');
  }

  /**
   * Find all companies, sorted alphabetically.
   * @returns {Promise<Object[]>}
   */
  async findAll() {
    throw new Error('ICompanyRepository.findAll() not implemented');
  }

  /**
   * Persist a company (create).
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async save(data) {
    throw new Error('ICompanyRepository.save() not implemented');
  }

  /**
   * Update a company by ID.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    throw new Error('ICompanyRepository.update() not implemented');
  }

  /**
   * Delete a company by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    throw new Error('ICompanyRepository.delete() not implemented');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IBlogRepository
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @abstract
 */
export class IBlogRepository {
  /**
   * Find a blog by its MongoDB ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('IBlogRepository.findById() not implemented');
  }

  /**
   * Find a blog by slug, applying visibility rules.
   * @param {string} slug
   * @param {Object|null} user - Current user (for permission checks)
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug, user = null) {
    throw new Error('IBlogRepository.findBySlug() not implemented');
  }

  /**
   * Find all blogs matching a filter, with sorting and pagination.
   * @param {Object} filter
   * @param {Object} sort
   * @param {Object} pagination
   * @returns {Promise<{ blogs: Object[], total: number }>}
   */
  async findAll(filter = {}, sort = {}, pagination = {}) {
    throw new Error('IBlogRepository.findAll() not implemented');
  }

  /**
   * Persist a blog (create).
   * @param {Object} blogData
   * @returns {Promise<Object>}
   */
  async save(blogData) {
    throw new Error('IBlogRepository.save() not implemented');
  }

  /**
   * Update a blog by ID.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    throw new Error('IBlogRepository.update() not implemented');
  }

  /**
   * Delete a blog by ID and clean up related data (comments, reports).
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    throw new Error('IBlogRepository.delete() not implemented');
  }

  /**
   * Count blogs matching a filter.
   * @param {Object} filter
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    throw new Error('IBlogRepository.count() not implemented');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ISubmissionRepository
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @abstract
 */
export class ISubmissionRepository {
  /**
   * Persist a submission.
   * @param {Object} submission
   * @returns {Promise<Object>}
   */
  async save(submission) {
    throw new Error('ISubmissionRepository.save() not implemented');
  }

  /**
   * Find all submissions for a user, newest first.
   * @param {string} userId
   * @param {Object} pagination - { page, limit }
   * @returns {Promise<Object[]>}
   */
  async findByUser(userId, pagination = {}) {
    throw new Error('ISubmissionRepository.findByUser() not implemented');
  }

  /**
   * Find submissions for a specific user + problem combo.
   * @param {string} userId
   * @param {string} problemId
   * @returns {Promise<Object[]>}
   */
  async findByUserAndProblem(userId, problemId) {
    throw new Error('ISubmissionRepository.findByUserAndProblem() not implemented');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IUserProgressRepository
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @abstract
 */
export class IUserProgressRepository {
  /**
   * Create or update a progress record for a user + problem.
   * @param {string} userId
   * @param {string} problemId
   * @param {Object} data - { status, notes }
   * @returns {Promise<Object>}
   */
  async upsert(userId, problemId, data) {
    throw new Error('IUserProgressRepository.upsert() not implemented');
  }

  /**
   * Find all progress records for a user.
   * @param {string} userId
   * @returns {Promise<Object[]>}
   */
  async findByUser(userId) {
    throw new Error('IUserProgressRepository.findByUser() not implemented');
  }

  /**
   * Find progress for a specific user + problem.
   * @param {string} userId
   * @param {string} problemId
   * @returns {Promise<Object|null>}
   */
  async findByUserAndProblem(userId, problemId) {
    throw new Error('IUserProgressRepository.findByUserAndProblem() not implemented');
  }

  /**
   * Delete a progress record.
   * @param {string} userId
   * @param {string} problemId
   * @returns {Promise<Object|null>}
   */
  async delete(userId, problemId) {
    throw new Error('IUserProgressRepository.delete() not implemented');
  }

  /**
   * Run aggregation pipelines to compute dashboard stats for a user.
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async aggregateStats(userId) {
    throw new Error('IUserProgressRepository.aggregateStats() not implemented');
  }
}
