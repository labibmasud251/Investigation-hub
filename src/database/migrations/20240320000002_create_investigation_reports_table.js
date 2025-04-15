exports.up = function(knex) {
  return knex.schema.createTable('investigation_reports', table => {
    table.increments('id').primary();
    table.integer('investigation_request_id').unsigned().notNullable();
    table.text('report_content').notNullable();
    table.integer('rating').unsigned().nullable();
    table.text('client_feedback').nullable();
    table.timestamps(true, true);

    table.foreign('investigation_request_id').references('id').inTable('investigation_requests').onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('investigation_reports');
}; 