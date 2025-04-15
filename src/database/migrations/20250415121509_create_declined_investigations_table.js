/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('declined_investigations', function(table) {
    table.integer('investigation_id').unsigned().notNullable();
    table.foreign('investigation_id').references('id').inTable('investigation_requests').onDelete('CASCADE');

    table.integer('investigator_id').unsigned().notNullable();
    table.foreign('investigator_id').references('id').inTable('users').onDelete('CASCADE');

    // Composite primary key to ensure an investigator can only decline an investigation once
    table.primary(['investigation_id', 'investigator_id']);

    table.timestamps(true, true); // Adds created_at and updated_at columns
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('declined_investigations');
};
