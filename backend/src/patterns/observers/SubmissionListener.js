/**
 * SubmissionListener — Abstract base listener (Observer pattern)
 *
 * Concrete listeners extend this class and implement onJudged().
 * Registered with SubmissionService to react to submission judgements.
 */
export class SubmissionListener {
  /**
   * Called when a submission has been judged (status finalized).
   * @abstract
   * @param {Object} submission - The judged submission object
   * @returns {Promise<void>}
   */
  async onJudged(submission) {
    throw new Error('SubmissionListener.onJudged() not implemented');
  }
}
