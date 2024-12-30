/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema.createTable('password_reset', (table) => {
		table.integer('user_id').unsigned().notNullable();
		table.foreign('user_id').references('id').inTable('users');

		table.string('token', 1024).notNullable();

		table.datetime('expires_at').notNullable();
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.dropTable('password_reset');
}
