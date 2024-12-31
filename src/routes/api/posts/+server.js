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
			.first(['id', 'user_id']);

		if (!existingPost) {
			return error(400, {
				error: true,
				field: 'reply_to',
				message: 'Unable to reply to post - post could not be found'
			});
		}

		insertData.reply_to = existingPost.id;

		if (existingPost.user_id != locals.user.id) {
			const notificationData = {
				user_id: existingPost.user_id,
				text: `{user:${locals.user.id}} replied to your {post:${existingPost.id}}`,
				seen: false
			};

			// Check if user (who's been replied to) already has a unseen notification for another reply on the same post
			const notification = await db('user_notifications').where(notificationData).first(['id']);

			if (!notification) {
				await db('user_notifications').insert(notificationData);
			}
		}
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

export async function PATCH({ request, locals, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before posting'
		});
	}

	const data = await request.json();

	if (!data.id) {
		return error(400, {
			error: true,
			field: 'id',
			message: 'Post ID is invalid'
		});
	}

	if (!validate.post.text(data.text)) {
		return error(400, {
			error: true,
			field: 'text',
			message: 'Text is invalid'
		});
	}

	const existingPost = await db('posts')
		.where({
			id: data.id,
			user_id: locals.user.id
		})
		.first(['id', 'text', 'updated_at']);

	if (!existingPost) {
		return error(400, {
			error: true,
			field: text,
			message: 'Post ID is invalid - post could not be found'
		});
	}

	try {
		await db('post_history').insert({
			post_id: existingPost.id,
			text: existingPost.text,

			// Set it to the actual time the post was either created, or last edited
			created_at: existingPost.updated_at
		});

		const post = await db('posts')
			.where({
				id: existingPost.id,
				user_id: locals.user.id
			})
			.update({
				text: data.text,
				updated_at: new Date(Date.now())
			});

		return json({
			success: true,

			data: {
				id: existingPost.id
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
