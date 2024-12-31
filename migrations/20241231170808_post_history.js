/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema.createTable('post_history', (table) => {
		table.integer('post_id').unsigned().notNullable();
		table.foreign('post_id').references('id').inTable('posts');

		table.string('text', 1024);

		table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.dropTable('post_history');
}
