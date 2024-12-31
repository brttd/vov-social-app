import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

function formatPost(data) {
	return {
		user: {
			id: data.user_id,
			username: data.user_username
		},

		id: data.id,
		text: data.text,
		created_at: data.created_at,
		updated_at: data.updated_at
	};
}

export async function GET({ locals, url }) {
	const query = db('posts')
		.orderBy('created_at', 'desc')
		.leftJoin('users', 'users.id', 'posts.user_id');

	const select = [
		'posts.id',
		'posts.text',
		'posts.created_at',
		'posts.updated_at',
		'users.id as user_id',
		'users.username as user_username'
	];

	if (url.searchParams.get('user')) {
		query.where({ user_id: url.searchParams.get('user') });
	} else if (locals.user) {
		query.whereIn(
			'user_id',
			db('user_follows').where({ user_id: locals.user.id }).select('follows_user_id')
		);
	}

	const data = await query.select(select);

	return json({
		start: 0,
		length: data.length,
		total: data.length,

		data: data.map(formatPost)
	});
}
