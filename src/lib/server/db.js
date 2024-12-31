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

export default db;
