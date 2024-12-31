import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function POST({ locals, request }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in to get notifications'
		});
	}

	const data = await request.json();

	if (!data.id) {
		return error(400, {
			error: true,
			field: 'id',
			message: 'ID is invalid'
		});
	}

	const notification = await db('user_notifications')
		.where({
			user_id: locals.user.id,
			id: data.id,
			seen: false
		})
		.first(['id']);

	if (!notification) {
		return error(400, {
			error: true,
			field: 'id',
			message: 'ID is invalid - notification could not be found'
		});
	}

	await db('user_notifications')
		.where({
			user_id: locals.user.id,
			id: notification.id
		})
		.update({ seen: true });

	return json({
		success: true,

		data: {
			id: notification.id
		}
	});
}
