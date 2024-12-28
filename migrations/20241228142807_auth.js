/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema.createTable('sessions', function (table) {
		table.string('id', 64).notNullable();

		table.integer('user_id').unsigned().notNullable();
		table.foreign('user_id').references('id').inTable('users');

		table.datetime('expires_at').notNullable();
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.dropTable('sessions');
}
