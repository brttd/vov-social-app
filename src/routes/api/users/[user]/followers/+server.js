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
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You must be logged in before seeing followers'
		});
	}

	const query = db('users').join('user_follows', 'user_follows.user_id', 'users.id').where({
		'user_follows.follows_user_id': params.user
	});

	const data = await query.select([
		'id',
		'username',
		// TODO: redo this to use the actual KNEX query builder
		db.raw(`(SELECT COUNT(*) from posts WHERE posts.user_id = users.id) as posts_count`),
		// TODO: redo this to use the actual KNEX query builder
		db.raw(
			`(SELECT COUNT(*) from user_follows WHERE user_id = ${locals.user.id} AND user_follows.follows_user_id = users.id) as following`
		)
	]);

	return json({
		data: data.map(formatUser)
	});
}
