import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';
import * as validate from '$lib/validate.js';

export async function POST({ request, locals, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before changing your username'
		});
	}

	const data = await request.json();

	let username = data.username;

	if (typeof username !== 'string') {
		return error(400, {
			error: true,
			field: 'username',
			message: 'Username is invalid (must be a string)!'
		});
	}

	username = username.trim().toLowerCase();

	if (!validate.user.username(username)) {
		return error(400, {
			error: true,
			field: 'username',
			message: 'Username is invalid (min length 3, max 31, all lowercase letters/numbers)!'
		});
	}

	const otherUser = await db('users')
		.where({
			username: username
		})
		.first(['id', 'username']);

	if (otherUser) {
		return error(400, {
			error: true,
			field: 'username',
			message: 'Username is already in use!'
		});
	}

	try {
		await db('user_history').insert({
			user_id: locals.user.id,
			username: locals.user.username
		});

		await db('users')
			.where({
				id: locals.user.id
			})
			.update({
				username: username
			});

		return json({
			success: true,

			data: {
				username: username
			}
		});
	} catch (e) {
		return error(500, {
			error: true,
			message: 'An error has occurred',
			details: e.message
		});
	}
}
