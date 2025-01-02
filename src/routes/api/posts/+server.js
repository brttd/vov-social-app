import { basename } from 'path';
import fs from 'node:fs/promises';

import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';
import * as validate from '$lib/validate.js';

import { FILES_PATH } from '$env/static/private';

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

		edits: data.edits.map(formatEdit),

		id: data.id,
		text: data.text,
		reply_to: data.reply_to,

		created_at: data.created_at,
		updated_at: data.updated_at,

		media: data.media.map(formatMedia)
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

	const ids = data.map((item) => item.id);

	if (ids.length > 0) {
		const edits = await db('post_history')
			.whereIn('post_id', ids)
			.select(['post_id', 'text', 'created_at']);

		const media = await db('post_media')
			.whereIn('post_id', ids)
			.select(['post_id', 'url', 'type', 'created_at']);

		for (let i = 0; i < data.length; i++) {
			data[i].edits = [];
			data[i].media = [];

			for (let j = edits.length - 1; j >= 0; j--) {
				if (edits[j].post_id == data[i].id) {
					data[i].edits.push(edits[j]);
					edits.splice(j, 1);
				}
			}

			for (let j = media.length - 1; j >= 0; j--) {
				if (media[j].post_id == data[i].id) {
					data[i].media.push(media[j]);
					media.splice(j, 1);
				}
			}
		}
	}

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

	const tempFolder = `${locals.user.id}/temp`;

	if (Array.isArray(data.files)) {
		for (let i = 0; i < data.files.length; i++) {
			if (typeof data.files[i] !== 'string') {
				return error(400, {
					error: true,
					field: 'files',
					message: 'Files array is invalid ([' + i + '] is not a string)'
				});
			}

			const filename = basename(data.files[i]);

			const filepath = `${tempFolder}/${filename}`;

			const s = await fs.stat(`${FILES_PATH}/${filepath}`);

			if (!s.isFile()) {
				return error(400, {
					error: true,
					field: 'files',
					message: 'Files array is invalid ([' + i + '] does not exist)'
				});
			}
		}
	}

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

		const postId = post[0];

		if (Array.isArray(data.files) && data.files.length > 0) {
			const postFolder = `${locals.user.id}/posts/${postId}`;

			await fs.mkdir(`${FILES_PATH}/${postFolder}`, { recursive: true });

			for (let i = 0; i < data.files.length; i++) {
				const filename = basename(data.files[i]);

				await fs.copyFile(
					`${FILES_PATH}/${tempFolder}/${filename}`,
					`${FILES_PATH}/${postFolder}/${filename}`
				);

				await fs.unlink(`${FILES_PATH}/${tempFolder}/${filename}`);

				await db('post_media').insert({
					post_id: postId,
					type: 0,
					url: `${postFolder}/${filename}`
				});
			}
		}

		return json({
			success: true,

			data: {
				id: postId
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
