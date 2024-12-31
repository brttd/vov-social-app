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
		reply_to: data.reply_to,

		created_at: data.created_at,
		updated_at: data.updated_at
	};
}

export async function GET({ locals, url }) {
	const query = db('posts')
		.orderBy('created_at', url.searchParams.get('reply') ? 'asc' : 'desc')
		.leftJoin('users', 'users.id', 'posts.user_id');

	const select = [
		'posts.id',
		'posts.text',
		'posts.reply_to',
		'posts.created_at',
		'posts.updated_at',
		'users.id as user_id',
		'users.username as user_username'
	];

	if (url.searchParams.get('user')) {
		query.where({ user_id: url.searchParams.get('user') }).where({ reply_to: null });
	} else if (url.searchParams.get('reply')) {
		query.where({
			reply_to: url.searchParams.get('reply')
		});
	} else if (locals.user) {
		query.where({ reply_to: null }).where(function () {
			this.whereIn(
				'user_id',
				db('user_follows').where({ user_id: locals.user.id }).select('follows_user_id')
			);
			this.orWhere({ user_id: locals.user.id });
		});
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

	const insertData = {
		text: data.text,
		user_id: locals.user.id
	};

	if (data.reply_to) {
		const existingPost = await db('posts')
			.where({
				id: data.reply_to
			})
			.first('id');

		if (!existingPost) {
			return error(400, {
				error: true,
				field: 'reply_to',
				message: 'Unable to reply to post - post could not be found'
			});
		}

		insertData.reply_to = existingPost.id;
	}

	try {
		const post = await db('posts').insert(insertData);

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
