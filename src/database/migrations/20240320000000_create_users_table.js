exports.up = function(knex) {
  return knex.schema
    .createTable('roles', table => {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.timestamps(true, true);
    })
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.text('bio').nullable();
      table.string('phone').nullable();
      table.timestamps(true, true);
    })
    .createTable('user_roles', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('role_id').unsigned().notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
      table.unique(['user_id', 'role_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('user_roles')
    .dropTable('users')
    .dropTable('roles');
}; 