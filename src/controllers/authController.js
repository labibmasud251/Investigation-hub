const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../database/knex');
const { createValidationError } = require('../utils/errors');

async function register(req, res, next) {
  try {
    const { email, password, first_name, last_name, roles } = req.body;

    // Check if user already exists
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      throw createValidationError('Email already registered');
    }

    // Validate roles
    if (!Array.isArray(roles) || roles.length === 0) {
      throw createValidationError('At least one role must be selected');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const trx = await knex.transaction();

    try {
      // Create user and get the ID
      const [userId] = await trx('users')
        .insert({
          email,
          password: hashedPassword,
          first_name,
          last_name
        });

      // Get the created user
      const user = await trx('users')
        .where({ id: userId })
        .select(['id', 'email', 'first_name', 'last_name'])
        .first();

      // Get role IDs
      const roleRecords = await trx('roles')
        .whereIn('name', roles)
        .select('id', 'name');

      // Assign roles to user
      await trx('user_roles').insert(
        roleRecords.map(role => ({
          user_id: user.id,
          role_id: role.id
        }))
      );

      await trx.commit();

      // Generate JWT
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            ...user,
            roles: roleRecords.map(role => role.name)
          },
          token
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await knex('users').where({ email }).first();
    if (!user) {
      throw createValidationError('Invalid email or password');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createValidationError('Invalid email or password');
    }

    // Get user roles
    const userRoles = await knex('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', user.id)
      .where('user_roles.is_active', true)
      .select('roles.name');

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      data: {
        user: {
          ...userWithoutPassword,
          roles: userRoles.map(role => role.name)
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

async function toggleRole(req, res, next) {
  try {
    const userId = req.user.id;
    
    // Get current user's active roles
    const currentRoles = await knex('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .where('user_roles.is_active', true)
      .select('roles.name');
    
    // Check if user has both roles
    const hasClientRole = currentRoles.some(role => role.name === 'client');
    const hasInvestigatorRole = currentRoles.some(role => role.name === 'investigator');
    
    if (!hasClientRole && !hasInvestigatorRole) {
      throw createValidationError('User must have at least one role (client or investigator)');
    }
    
    // Get role IDs
    const clientRole = await knex('roles').where({ name: 'client' }).first();
    const investigatorRole = await knex('roles').where({ name: 'investigator' }).first();
    
    if (!clientRole || !investigatorRole) {
      throw createValidationError('Required roles not found in the system');
    }
    
    // Determine which role to toggle to
    let targetRoleId;
    let targetRoleName;
    
    if (hasClientRole && !hasInvestigatorRole) {
      // Currently client, switch to investigator
      targetRoleId = investigatorRole.id;
      targetRoleName = 'investigator';
    } else if (!hasClientRole && hasInvestigatorRole) {
      // Currently investigator, switch to client
      targetRoleId = clientRole.id;
      targetRoleName = 'client';
    } else {
      // User has both roles, toggle based on current JWT role
      const currentJwtRole = req.user.role || 'client'; // Default to client if not specified
      
      if (currentJwtRole === 'client') {
        // Currently using client role, switch to investigator
        targetRoleId = investigatorRole.id;
        targetRoleName = 'investigator';
      } else {
        // Currently using investigator role, switch to client
        targetRoleId = clientRole.id;
        targetRoleName = 'client';
      }
    }
    
    // Check if user already has the target role
    const userRole = await knex('user_roles')
      .where({ user_id: userId, role_id: targetRoleId })
      .first();
    
    if (userRole) {
      // Role exists, ensure it's active
      if (!userRole.is_active) {
        await knex('user_roles')
          .where({ user_id: userId, role_id: targetRoleId })
          .update({ is_active: true });
      }
    } else {
      // Add role
      await knex('user_roles').insert({
        user_id: userId,
        role_id: targetRoleId,
        is_active: true
      });
    }
    
    // Get updated roles
    const updatedRoles = await knex('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .where('user_roles.is_active', true)
      .select('roles.name');
    
    // Generate new JWT with updated role
    const token = jwt.sign(
      { 
        id: userId,
        role: targetRoleName
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      status: 'success',
      data: {
        roles: updatedRoles.map(role => role.name),
        activeRole: targetRoleName,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  toggleRole
}; 