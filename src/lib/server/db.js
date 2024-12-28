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
async function getUser(query) {
	const data = await db('users').where(query).select();

	if (data.length === 0) {
		return null;
	}

	return { ...data[0] };
}

async function parsePost(data) {
	return {
		user: await getUser({ id: data.user_id }),

		text: data.text,
		created_at: new Date(data.created_at),
		updated_at: new Date(data.updated_at)
	};
}

async function getPosts(query = null) {
	let data = [];

	if (query) {
		data = await db('posts').where(query).select().orderBy('created_at', 'desc');
	} else {
		data = await db('posts').select().orderBy('created_at', 'desc');
	}

	return Promise.all(data.map(parsePost));
}
async function getPost(id) {
	const data = await db('users').where({ id: id }).first();

	if (data.length === 0) {
		return null;
	}

	return await parsePost(data);
}

export default db;
export { db, getUser, getUsers, getPost, getPosts };
