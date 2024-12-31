import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';
import * as validate from '$lib/validate.js';

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
		query
			.whereIn(
			'user_id',
			db('user_follows').where({ user_id: locals.user.id }).select('follows_user_id')
			)
			.orWhere({ user_id: locals.user.id });
	}

	const data = await query.select(select);

	return json({
		start: 0,
		length: data.length,
		total: data.length,

		data: data.map(formatPost)
	});
}

export async function POST({ request, locals, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before posting'
		});
	}

	const data = await request.json();

	if (!validate.post.text(data.text)) {
		return error(400, {
			error: true,
			field: 'text',
			message: 'Text is invalid'
		});
	}

	try {
		const post = await db('posts').insert({
			text: data.text,
			user_id: locals.user.id
		});

		return json({
			success: true,

			data: {
				id: post[0]
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
