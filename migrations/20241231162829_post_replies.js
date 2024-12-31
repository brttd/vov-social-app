/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema.alterTable('posts', (table) => {
		table.integer('reply_to').unsigned();
		table.foreign('reply_to').references('id').inTable('posts');
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.alterTable('posts', (table) => {
		table.dropColumn('reply_to');
	});
}
