/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema.alterTable('posts', function (table) {
		table.timestamps(false, true, false);
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.alterTable('posts', function (table) {
		table.dropTimestamps(false);
	});
}
