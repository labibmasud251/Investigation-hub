const knex = require('../database/knex');

async function getDashboardData(req, res, next) {
  try {
    const userId = req.user.id;

    // Get user roles
    const userRoles = await knex('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .where('user_roles.is_active', true)
      .select('roles.name');

    const roles = userRoles.map(role => role.name);
    const isClient = roles.includes('client');
    const isInvestigator = roles.includes('investigator');

    const dashboardData = {
      roles,
      statistics: {},
      recentInvestigations: [],
      pendingActions: []
    };

    // Get client statistics
    if (isClient) {
      const clientStats = await knex('investigation_requests')
        .where('client_id', userId)
        .select(
          knex.raw('COUNT(*) as total_requests'),
          knex.raw('COUNT(CASE WHEN status = "submitted" THEN 1 END) as submitted_requests'),
          knex.raw('COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_requests'),
          knex.raw('COUNT(CASE WHEN status = "completed" THEN 1 END) as completed_requests')
        )
        .first();

      dashboardData.statistics.client = clientStats;

      // Get recent client investigations
      const recentClientInvestigations = await knex('investigation_requests')
        .where('client_id', userId)
        .orderBy('created_at', 'desc')
        .limit(5)
        .select('*');

      dashboardData.recentInvestigations.client = recentClientInvestigations;
    }

    // Get investigator statistics
    if (isInvestigator) {
      const investigatorStats = await knex('investigation_requests')
        .where('investigator_id', userId)
        .select(
          knex.raw('COUNT(*) as total_assignments'),
          knex.raw('COUNT(CASE WHEN status = "pending" THEN 1 END) as active_assignments'),
          knex.raw('COUNT(CASE WHEN status = "completed" THEN 1 END) as completed_assignments')
          //knex.raw('AVG(rating) as average_rating')
        )
        .first();

      dashboardData.statistics.investigator = investigatorStats;

      // Get recent investigator assignments
      const recentInvestigatorAssignments = await knex('investigation_requests')
        .where('investigator_id', userId)
        .orderBy('created_at', 'desc')
        .limit(5)
        .select('*');

      dashboardData.recentInvestigations.investigator = recentInvestigatorAssignments;
    }

    // Get pending actions
    if (isClient) {
      const pendingClientActions = await knex('investigation_reports')
        .join('investigation_requests', 'investigation_reports.investigation_request_id', 'investigation_requests.id')
        .where('investigation_requests.client_id', userId)
        .whereNull('investigation_reports.rating')
        .select('investigation_reports.*', 'investigation_requests.title')
        .limit(5);

      dashboardData.pendingActions.client = pendingClientActions;
    }

    if (isInvestigator) {
      const pendingInvestigatorActions = await knex('investigation_requests')
        .where('investigator_id', userId)
        .where('status', 'pending')
        .select('*')
        .limit(5);

      dashboardData.pendingActions.investigator = pendingInvestigatorActions;
    }

    res.json({
      status: 'success',
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardData
}; 