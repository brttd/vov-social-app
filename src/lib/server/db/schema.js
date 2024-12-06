import { mysqlTable, serial, text, int, varchar, bigint } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: bigint('id', { mode: 'bigint', unsigned: true }).notNull().autoincrement().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique()
});

export const posts = mysqlTable('posts', {
	id: bigint('id', { unsigned: true }).notNull().autoincrement().primaryKey(),
	text: varchar('text', { length: 512 }).notNull()
});
