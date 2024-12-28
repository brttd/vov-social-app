import { config } from 'dotenv';
config();

const primary = {
	client: 'mysql2',

	connection: {
		host: process.env.DB_HOST || 'localhost',
		port: process.env.DB_PORT || 3306,
		user: process.env.DB_USER || 'root',
		password: process.env.DB_PASS || '',
		database: process.env.DB_NAME || ''
	}
};

export const development = primary;
export const staging = primary;
export const production = primary;
