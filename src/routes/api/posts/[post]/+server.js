import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';

function formatEdit(data) {
	return {
		text: data.text,

		time: data.created_at
	};
}

function formatMedia(data) {
	return {
		url: data.url,
		type: data.type === 1 ? 'image' : 'unknown',
		time: data.created_at
	};
}

function formatPost(data) {
	return {
		user: {
			id: data.user_id,
			username: data.user_username
		},

		reaction: data.reaction,
		reactions: data.reactions.map((item) => item.reaction_id),

		edits: data.edits.map(formatEdit),

		id: data.id,
		text: data.text,
		reply_to: data.reply_to,

		created_at: data.created_at,
		updated_at: data.updated_at,

		media: data.media.map(formatMedia)
	};
}

export async function GET({ locals, params }) {
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

	if (!data) {
		return error(404, {
			error: true,
			message: 'Post not found'
		});
	}

	data.edits = await db('post_history')
		.where({ post_id: data.id })
		.orderBy('created_at', 'desc')
		.select(['text', 'created_at']);

	data.media = await db('post_media')
		.where({ post_id: data.id })
		.orderBy('created_at', 'desc')
		.select(['url', 'type', 'created_at']);

	if (locals.user) {
		data.reaction = (
			await db('post_reactions')
				.where({ post_id: data.id, user_id: locals.user.id })
				.first(['reaction_id'])
		)?.reaction_id;

		data.reactions = await db('post_reactions')
			.where({ post_id: data.id })
			.whereNot({ user_id: locals.user.id })

			.select(['reaction_id']);
	} else {
		data.reaction = null;

		data.reactions = await db('post_reactions').where({ post_id: data.id }).select(['reaction_id']);
	}

	return json({
		data: formatPost(data)
	});
}
