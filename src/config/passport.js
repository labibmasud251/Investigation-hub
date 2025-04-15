const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const knex = require('../database/knex');
const { createUnauthorizedError } = require('../utils/errors');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
};

passport.use(
  new JwtStrategy(options, async (jwtPayload, done) => {
    try {
      const user = await knex('users')
        .where({ id: jwtPayload.id })
        .first();

      if (!user) {
        return done(createUnauthorizedError('User not found'), false);
      }

      // Get user roles
      const userRoles = await knex('user_roles')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .where('user_roles.user_id', user.id)
        .where('user_roles.is_active', true)
        .select('roles.name');

      // Add roles to user object
      user.roles = userRoles.map(role => role.name);
      
      // Set the active role from JWT payload or default to the first role
      user.role = jwtPayload.role || (user.roles.length > 0 ? user.roles[0] : null);

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
); 