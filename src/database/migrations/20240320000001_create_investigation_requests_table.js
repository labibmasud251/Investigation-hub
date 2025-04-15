exports.up = function(knex) {
  return knex.schema.createTable('investigation_requests', table => {
    table.increments('id').primary();
    table.integer('client_id').unsigned().notNullable();
    table.integer('investigator_id').unsigned().nullable();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.enum('status', ['submitted', 'pending', 'completed']).defaultTo('submitted');
    table.decimal('budget', 10, 2).nullable();
    table.date('deadline').nullable();
    table.timestamps(true, true);

    table.foreign('client_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('investigator_id').references('id').inTable('users').onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('investigation_requests');
}; 