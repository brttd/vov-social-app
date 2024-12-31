/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema.createTable('user_follows', (table) => {
		table.integer('user_id').unsigned().notNullable();
		table.foreign('user_id').references('id').inTable('users');

		table.integer('follows_user_id').unsigned().notNullable();
		table.foreign('follows_user_id').references('id').inTable('users');
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.dropTable('user_follows');
}
