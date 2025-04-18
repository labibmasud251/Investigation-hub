const knex = require('../database/knex');
const { createValidationError, createNotFoundError } = require('../utils/errors');

async function getInvestigations(req, res, next) {
  try {
    const { status, role, id } = req.query;
    console.dir(req.query);
    let query = knex('investigation_requests')
      .select(
        'investigation_requests.*',
        'clients.first_name as client_first_name',
        'clients.last_name as client_last_name',
        'investigators.first_name as investigator_first_name',
        'investigators.last_name as investigator_last_name'
      )
      .leftJoin('users as clients', 'investigation_requests.client_id', 'clients.id')
      .leftJoin('users as investigators', 'investigation_requests.investigator_id', 'investigators.id');

    if (status) {
      query = query.where('investigation_requests.status', status);
    }

    if (id) {
      query = query.where('investigation_requests.id', id);
    }

    if (req.user.role === 'client') {
      query = query.where('investigation_requests.client_id', req.user.id);
    } else if (req.user.role === 'investigator') {
      query = query.where(function() {
        this.where('investigation_requests.investigator_id', req.user.id)
          .orWhere('investigation_requests.investigator_id', null);
      });

      // Filter out investigations declined by the current investigator
      query = query.whereNotIn('investigation_requests.id', function() {
        this.select('investigation_id')
          .from('declined_investigations')
          .where('investigator_id', req.user.id);
      });
    }

    const requests = await query;
    res.json({ status: 'success', data: requests });
  } catch (error) {
    next(error);
  }
}

async function createInvestigation(req, res, next) {
  try {
    const { title, description, budget, deadline } = req.body;

    const [request] = await knex('investigation_requests')
      .insert({
        client_id: req.user.id,
        title,
        description,
        budget,
        deadline,
        status: 'submitted'
      })
      .returning('*');

    res.status(201).json({ status: 'success', data: request });
  } catch (error) {
    next(error);
  }
}

async function acceptInvestigation(req, res, next) {
  const { id } = req.params;
  const investigatorId = req.user.id;

  try {
    const updatedRequest = await knex.transaction(async (trx) => {
      // Attempt to update the request only if it's currently 'submitted' and has no investigator
      const updatedCount = await trx('investigation_requests')
        .where({
          id: id,
          status: 'submitted',
          investigator_id: null // Ensure it hasn't been accepted by someone else
        })
        .update({
          investigator_id: investigatorId,
          status: 'pending'
        });

      // If no rows were updated, it means the request was already accepted or doesn't exist
      if (updatedCount === 0) {
        // Check if it exists but was already accepted to give a more specific error
        const existingRequest = await trx('investigation_requests').where({ id }).first();
        if (!existingRequest) {
          throw createNotFoundError('Investigation request not found.');
        } else if (existingRequest.status !== 'submitted' || existingRequest.investigator_id !== null) {
          throw createValidationError('Investigation request has already been accepted or is not available.');
        } else {
           // Should not happen based on update condition, but include for completeness
          throw createNotFoundError('Failed to accept investigation request.');
        }
      }

      // Fetch the updated request data to return
      const result = await trx('investigation_requests')
        .where({ id: id, investigator_id: investigatorId }) // Verify it was updated by this user
        .first();

      if (!result) {
        // This case should ideally not be reached if updatedCount > 0
        throw new Error('Failed to retrieve updated investigation request after accepting.');
      }
      return result;
    });

    res.json({ status: 'success', data: updatedRequest });
  } catch (error) {
    next(error);
  }
}

async function completeInvestigation(req, res, next) {
  const { id } = req.params;
  const investigatorId = req.user.id;

  try {
    const updatedRequest = await knex.transaction(async (trx) => {
      // Attempt to update the request only if it's assigned to this investigator and is 'pending'
      const updatedCount = await trx('investigation_requests')
        .where({
          id: id,
          investigator_id: investigatorId,
          status: 'pending'
        })
        .update({
          status: 'completed'
        });

      // If no rows were updated, the request wasn't found, wasn't assigned, or wasn't pending
      if (updatedCount === 0) {
         const existingRequest = await trx('investigation_requests').where({ id }).first();
         if (!existingRequest) {
            throw createNotFoundError('Investigation request not found.');
         } else if (existingRequest.investigator_id !== investigatorId) {
            throw createValidationError('Investigation not assigned to this investigator.');
         } else if (existingRequest.status !== 'pending') {
            throw createValidationError(`Investigation status is '${existingRequest.status}', not 'pending'. Cannot complete.`);
         } else {
            throw createNotFoundError('Failed to complete investigation request.');
         }
      }

      // Fetch the updated request data to return
      const result = await trx('investigation_requests')
        .where({ id: id, status: 'completed' }) // Verify it's completed
        .first();

       if (!result) {
         // This case should ideally not be reached if updatedCount > 0
         throw new Error('Failed to retrieve updated investigation request after completion.');
       }
      return result;
    });

    res.json({ status: 'success', data: updatedRequest });
  } catch (error) {
    next(error);
  }
}

async function declineInvestigation(req, res, next) {
  const { id } = req.params; // Investigation ID
  const investigatorId = req.user.id;

  try {
    // Check if the investigation exists and is in a state that can be declined (e.g., 'submitted')
    const investigation = await knex('investigation_requests')
      .where({ id: id, status: 'submitted', investigator_id: null }) // Can only decline unassigned, submitted requests
      .first();

    if (!investigation) {
      // Check if it exists but is already assigned or not submitted
      const existingRequest = await knex('investigation_requests').where({ id }).first();
      if (!existingRequest) {
        throw createNotFoundError('Investigation request not found.');
      } else if (existingRequest.status !== 'submitted' || existingRequest.investigator_id !== null) {
        throw createValidationError('Investigation request cannot be declined (already accepted or not in submitted state).');
      } else {
        throw createNotFoundError('Investigation request not found or cannot be declined.'); // Generic fallback
      }
    }

    // Check if the investigator has already declined this investigation
    const alreadyDeclined = await knex('declined_investigations')
      .where({ investigation_id: id, investigator_id: investigatorId })
      .first();

    if (alreadyDeclined) {
      return res.status(409).json({ status: 'fail', message: 'Investigation already declined by you.' });
    }

    // Record the decline action
    await knex('declined_investigations').insert({
      investigation_id: id,
      investigator_id: investigatorId,
    });

    res.status(200).json({ status: 'success', message: 'Investigation declined successfully.' });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  getInvestigations,
  createInvestigation,
  acceptInvestigation,
  completeInvestigation,
  declineInvestigation // Export the new function
};
