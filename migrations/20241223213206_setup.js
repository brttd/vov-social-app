/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema
		.createTable('users', function (table) {
			table.increments('id');

			table.string('username').unique().notNullable();
			table.string('password', 255).notNullable();

			table.string('email');
		})
		.createTable('posts', function (table) {
			table.increments('id');
			table.integer('user_id').unsigned().notNullable();
			table.foreign('user_id').references('id').inTable('users');

			table.string('text', 1024);
		});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.dropTable('posts').dropTable('users');
}
