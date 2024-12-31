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

export async function GET({ params }) {
	const query = db('posts')
		.leftJoin('users', 'users.id', 'posts.user_id')
		.where({ 'posts.id': params.post });

	const select = [
		'posts.id',
		'posts.text',
		'posts.created_at',
		'posts.updated_at',
		'users.id as user_id',
		'users.username as user_username'
	];

	const data = await query.first(select);

	return json({
		data: formatPost(data)
	});
}
