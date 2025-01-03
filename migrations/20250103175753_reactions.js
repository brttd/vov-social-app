/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema
		.createTable('reactions', (table) => {
			table.increments('id');

			table.string('text', 4).notNullable();
		})
		.createTable('post_reactions', (table) => {
			table.integer('user_id').unsigned().notNullable();
			table.foreign('user_id').references('id').inTable('users');

			table.integer('post_id').unsigned().notNullable();
			table.foreign('post_id').references('id').inTable('posts');

			table.integer('reaction_id').unsigned().notNullable();
			table.foreign('reaction_id').references('id').inTable('reactions');

			table.unique(['user_id', 'post_id']);
		})
		.then(() =>
			knex('reactions').insert({
				text: '❤️'
			})
		)
		.then(() =>
			knex('reactions').insert({
				text: '👍🏻'
			})
		)
		.then(() =>
			knex('reactions').insert({
				text: '👎🏻'
			})
		);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.dropTable('post_reactions').dropTable('reactions');
}
