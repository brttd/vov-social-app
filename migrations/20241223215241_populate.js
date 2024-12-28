/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex('users').insert([
		{
			name: 'Brett Doyle',
			email: 'brettdoyle@protonmail.com'
		}
	]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex('users').del();
}
