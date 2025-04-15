const knex = require('../database/knex');
const { createValidationError, createNotFoundError } = require('../utils/errors');

async function submitReport(req, res, next) {
  const { investigationId } = req.params;
  const { report_content } = req.body;
  const investigatorId = req.user.id;

  try {
    const report = await knex.transaction(async (trx) => {
      // 1. Check if investigation exists, is completed, and assigned to this investigator
      const investigation = await trx('investigation_requests')
        .where({
          id: investigationId,
          investigator_id: investigatorId,
          status: 'completed'
        })
        .first();

      if (!investigation) {
        // Check specific reason for failure
        const checkExists = await trx('investigation_requests').where({ id: investigationId }).first();
        if (!checkExists) {
            throw createNotFoundError('Investigation not found.');
        } else if (checkExists.investigator_id !== investigatorId) {
            throw createValidationError('Investigation not assigned to this investigator.');
        } else if (checkExists.status !== 'completed') {
            throw createValidationError(`Investigation status is '${checkExists.status}', not 'completed'. Cannot submit report yet.`);
        } else {
            throw createNotFoundError('Investigation not found or not ready for report submission.');
        }
      }

      // 2. Check if a report already exists for this investigation
      const existingReport = await trx('investigation_reports')
        .where({ investigation_request_id: investigationId })
        .first();

      if (existingReport) {
        throw createValidationError('A report has already been submitted for this investigation.');
      }

      // 3. Insert the new report
      const [newReport] = await trx('investigation_reports')
        .insert({
          investigation_request_id: investigationId,
          report_content: report_content
        })
        .returning('*'); // Return the newly created report

      if (!newReport) {
          throw new Error('Failed to create the report entry.');
      }
      return newReport;
    });

    res.status(201).json({ status: 'success', data: report });
  } catch (error) {
    next(error);
  }
}

async function rateReport(req, res, next) {
  const { investigationId } = req.params;
  const { rating, client_feedback } = req.body;
  const clientId = req.user.id;

  if (rating < 1 || rating > 5) {
    return next(createValidationError('Rating must be between 1 and 5'));
  }

  try {
    const updatedReport = await knex.transaction(async (trx) => {
      // 1. Check if investigation exists, belongs to the client, and is completed
      const investigation = await trx('investigation_requests')
        .where({
          id: investigationId,
          client_id: clientId,
          status: 'completed'
        })
        .first();

      if (!investigation) {
        // Check specific reason for failure
        const checkExists = await trx('investigation_requests').where({ id: investigationId }).first();
        if (!checkExists) {
            throw createNotFoundError('Investigation not found.');
        } else if (checkExists.client_id !== clientId) {
            throw createValidationError('This investigation does not belong to you.');
        } else if (checkExists.status !== 'completed') {
            throw createValidationError(`Investigation status is '${checkExists.status}', not 'completed'. Cannot rate report yet.`);
        } else {
            throw createNotFoundError('Investigation not found or not ready for rating.');
        }
      }

      // 2. Attempt to update the report rating only if it exists and hasn't been rated yet
      const updatedCount = await trx('investigation_reports')
        .where({
          investigation_request_id: investigationId,
          rating: null // Ensure it hasn't been rated already
        })
        .update({
          rating: rating,
          client_feedback: client_feedback || null // Allow optional feedback
        });

      // If no rows were updated, the report doesn't exist or was already rated
      if (updatedCount === 0) {
        const existingReport = await trx('investigation_reports')
            .where({ investigation_request_id: investigationId })
            .first();
        if (!existingReport) {
            throw createNotFoundError('Report not found for this investigation.');
        } else if (existingReport.rating !== null) {
            throw createValidationError('This report has already been rated.');
        } else {
            throw createNotFoundError('Failed to rate the report.');
        }
      }

      // 3. Fetch the updated report data
      const result = await trx('investigation_reports')
        .where({ investigation_request_id: investigationId })
        .first();

      if (!result) {
          throw new Error('Failed to retrieve updated report after rating.');
      }
      return result;
    });

    res.json({ status: 'success', data: updatedReport });
  } catch (error) {
    next(error);
  }
}

async function getReport(req, res, next) {
  try {
    const { investigationId } = req.params;

    // Check if user has access to this investigation
    const investigation = await knex('investigation_requests')
      .where({
        id: investigationId,
        status: 'completed'
      })
      .andWhere(function() {
        this.where('client_id', req.user.id)
          .orWhere('investigator_id', req.user.id);
      })
      .first();

    if (!investigation) {
      throw createNotFoundError('Investigation not found or access denied');
    }

    const report = await knex('investigation_reports')
      .where({ investigation_request_id: investigationId })
      .first();

    if (!report) {
      throw createNotFoundError('Report not found for this investigation');
    }

    res.json({ status: 'success', data: report });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitReport,
  rateReport,
  getReport
};
