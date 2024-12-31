import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function POST({ request, locals, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before following'
		});
	}

	const data = await request.json();

	if (!data.id) {
		return error(400, {
			error: true,
			field: 'id',
			message: 'User (to follow) ID is invalid'
		});
	}

	const userToFollow = await db('users')
		.where({
			id: data.id
		})
		.first('id');

	if (!userToFollow) {
		return error(400, {
			error: true,
			field: 'id',
			message: 'User (to follow) ID is invalid (user not found)'
		});
	}

	await db('user_follows').insert({
		user_id: locals.user.id,
		follows_user_id: userToFollow.id
	});

	const notificationData = {
		user_id: userToFollow.id,
		text: `{user:${locals.user.id}} followed you`,
		seen: false
	};

	// Check if user (who's been followed) already has a unseen notification for the follow
	const notification = await db('user_notifications').where(notificationData).first(['id']);

	if (!notification) {
		await db('user_notifications').insert(notificationData);
	}

	return json({
		success: true,

		data: {
			id: userToFollow.id,
			following: true
		}
	});
}
