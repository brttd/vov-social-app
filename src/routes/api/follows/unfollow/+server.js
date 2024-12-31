import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function POST({ request, locals, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before unfollowing'
		});
	}

	const data = await request.json();

	const userToUnfollow = await db('users')
		.where({
			id: data.id
		})
		.first('id');

	if (!userToUnfollow) {
		return error(400, {
			error: true,
			field: 'id',
			message: 'User (to unfollow) ID is invalid'
		});
	}

	await db('user_follows')
		.where({
			user_id: locals.user.id,
			follows_user_id: userToUnfollow.id
		})
		.del();

	return json({
		success: true,

		data: {
			id: userToUnfollow.id,
			following: false
		}
	});
}
