import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function POST({ request, locals, params, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before unfollowing'
		});
	}

	const userToUnfollow = await db('users')
		.where(
			url.searchParams.get('lookup') === 'username'
				? {
						username: params.user
					}
				: {
						id: params.user
					}
		)
		.first('id');

	if (!userToUnfollow) {
		return error(400, {
			error: true,
			field: 'id',
			message: 'User (to unfollow) is invalid (user not found)'
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
