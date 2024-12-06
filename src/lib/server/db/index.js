import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = await mysql.createConnection(env.DATABASE_URL);

const db = drizzle(client);

export default db;
