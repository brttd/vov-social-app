import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

function formatEdit(data) {
	return {
		text: data.text,

		time: data.created_at
	};
}

function formatPost(data, edits) {
	return {
		user: {
			id: data.user_id,
			username: data.user_username
		},

		edits: edits.map(formatEdit),

		id: data.id,
		text: data.text,
		reply_to: data.reply_to,

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
		'posts.reply_to',
		'posts.created_at',
		'posts.updated_at',
		'users.id as user_id',
		'users.username as user_username'
	];

	const data = await query.first(select);

	const edits = await db('post_history')
		.where({ post_id: data.id })
		.orderBy('created_at', 'desc')
		.select(['text', 'created_at']);

	return json({
		data: formatPost(data, edits)
	});
}
