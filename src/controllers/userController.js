const bcrypt = require('bcrypt');
const knex = require('../database/knex');
const { createValidationError, createNotFoundError } = require('../utils/errors');

async function getProfile(req, res, next) {
  try {
    const user = await knex('users')
      .where({ id: req.user.id })
      .select('id', 'email', 'first_name', 'last_name', 'role', 'bio', 'phone')
      .first();

    if (!user) {
      throw createNotFoundError('User not found');
    }

    res.json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { first_name, last_name, bio, phone, current_password, new_password } = req.body;

    const user = await knex('users').where({ id: req.user.id }).first();

    if (!user) {
      throw createNotFoundError('User not found');
    }

    const updates = {};

    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone;

    // Handle password change if provided
    if (current_password && new_password) {
      const isValidPassword = await bcrypt.compare(current_password, user.password);
      if (!isValidPassword) {
        throw createValidationError('Current password is incorrect');
      }
      updates.password = await bcrypt.hash(new_password, 10);
    }

    const [updatedUser] = await knex('users')
      .where({ id: req.user.id })
      .update(updates)
      .returning(['id', 'email', 'first_name', 'last_name', 'role', 'bio', 'phone']);

    res.json({ status: 'success', data: updatedUser });
  } catch (error) {
    next(error);
  }
}

async function getInvestigatorProfile(req, res, next) {
  try {
    const { id } = req.params;

    const investigator = await knex('users')
      .where({ id, role: 'investigator' })
      .select('id', 'first_name', 'last_name', 'bio', 'phone')
      .first();

    if (!investigator) {
      throw createNotFoundError('Investigator not found');
    }

    // Get average rating
    const ratings = await knex('investigation_reports')
      .join('investigation_requests', 'investigation_reports.investigation_request_id', 'investigation_requests.id')
      .where('investigation_requests.investigator_id', id)
      .whereNotNull('rating')
      .select(knex.raw('AVG(rating) as average_rating, COUNT(*) as total_ratings'));

    investigator.ratings = ratings[0];

    res.json({ status: 'success', data: investigator });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getInvestigatorProfile
}; 