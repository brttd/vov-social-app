import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';

function formatUser(data) {
	return {
		id: data.id,
		username: data.username,
		following: data.following ? true : false,
		posts_count: data.posts_count
	};
}

export async function GET({ locals, params, url }) {
	const query = db('users');

	if (url.searchParams.get('lookup') === 'username') {
		query.where({ username: params.user });
	} else {
		query.where({ id: params.user });
	}

	const data = await query.first([
		'id',
		'username',
		// TODO: redo this to use the actual KNEX query builder
		db.raw(`(SELECT COUNT(*) from posts WHERE posts.user_id = users.id) as posts_count`),
		locals.user
			? // TODO: redo this to use the actual KNEX query builder
				db.raw(
					`(SELECT COUNT(*) from user_follows WHERE user_id = ${locals.user.id} AND user_follows.follows_user_id = users.id) as following`
				)
			: db.raw(`(SELECT 0) as following`)
	]);

	if (data) {
		return json({
			data: formatUser(data)
		});
	}

	return error(404, {
		error: true,
		message: 'User not found'
	});
}
