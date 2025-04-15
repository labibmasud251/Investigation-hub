const passport = require('passport');
const knex = require('../database/knex');
const { createUnauthorizedError } = require('../utils/errors');

const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, _info) => {
    if (err) return next(err);
    if (!user) {
      throw createUnauthorizedError('Authentication required');
    }
    console.dir(user);
    req.user = user;
    next();
  })(req, res, next);
};

const authorize = (...roles) => {
  return async (req, _res, next) => {
    try {
      // Get user's active roles
      const userRoles = await knex('user_roles')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .where('user_roles.user_id', req.user.id)
        .where('user_roles.is_active', true)
        .select('roles.name');

      const userRoleNames = userRoles.map(role => role.name);
      const hasRequiredRole = roles.some(role => userRoleNames.includes(role));

      if (!hasRequiredRole) {
        throw createUnauthorizedError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authenticate, authorize }; 