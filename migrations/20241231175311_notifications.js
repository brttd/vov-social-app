/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema.createTable('user_notifications', (table) => {
		table.increments('id');

		table.integer('user_id').unsigned().notNullable();
		table.foreign('user_id').references('id').inTable('users');

		table.string('text', 1024);
		table.boolean('seen').notNullable().defaultTo(false);

		table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.dropTable('user_notifications');
}
