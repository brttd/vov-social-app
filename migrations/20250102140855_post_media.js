/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema.createTable('post_media', (table) => {
		table.increments('id');

		table.integer('post_id').unsigned().notNullable();
		table.foreign('post_id').references('id').inTable('posts');

		table.integer('type').unsigned().notNullable().defaultTo(0);
		table.string('url', 512).notNullable();

		table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.dropTable('post_media');
}
