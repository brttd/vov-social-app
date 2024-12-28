import { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } from '$env/static/private';

import knex from 'knex';

const db = knex({
	client: 'mysql2',

	connection: {
		host: DB_HOST || 'localhost',
		port: DB_PORT || 3306,
		user: DB_USER || 'root',
		password: DB_PASS || '',
		database: DB_NAME || ''
	}
});

async function getUsers() {
	const data = await db('users').select();

	return data.map((entry) => {
		return { ...entry };
	});
}
async function getUser(id) {
	const data = await db('users').where({ id: id }).select();

	if (data.length === 0) {
		return null;
	}

	return { ...data[0] };
}

async function getPosts() {
	const data = await db('posts').select();

	return Promise.all(
		data.map(async (entry) => {
			const user = await getUser(entry.user_id);

			return { ...entry, user: user };
		})
	);
}
async function getPost(id) {
	const data = await db('users').where({ id: id }).select();

	if (data.length === 0) {
		return null;
	}

	const user = await getUser(data[0].user_id);

	return { ...data[0], user: user };
}

export default db;
export { getUser, getUsers, getPost, getPosts };
