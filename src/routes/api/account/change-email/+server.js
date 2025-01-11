import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';
import * as validate from '$lib/validate.js';

export async function POST({ request, locals, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before changing your email'
		});
	}

	const data = await request.json();

	let email = data.email;

	if (typeof email !== 'string') {
		return error(400, {
			error: true,
			field: 'email',
			message: 'Email is invalid (must be a string)!'
		});
	}

	email = email.trim().toLowerCase();

	if (!validate.user.email(email)) {
		return error(400, {
			error: true,
			field: 'email',
			message: 'Email is invalid (doesnt seem to be a valid email address)!'
		});
	}

	const otherUser = await db('users')
		.where({
			email: email
		})
		.first(['id', 'email']);

	if (otherUser) {
		return error(400, {
			error: true,
			field: 'email',
			message: 'Email is already in use!'
		});
	}

	try {
		await db('user_history').insert({
			user_id: locals.user.id,
			email: locals.user.email
		});

		await db('users')
			.where({
				id: locals.user.id
			})
			.update({
				email: email
			});

		return json({
			success: true,

			data: {
				email: email
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
