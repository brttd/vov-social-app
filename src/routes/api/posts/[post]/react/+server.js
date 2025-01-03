import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function POST({ request, locals, params }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before reacting'
		});
	}

	const data = await request.json();

	if (data.reaction === null) {
		try {
			await db('post_reactions')
				.where({
					user_id: locals.user.id,
					post_id: params.post
				})
				.del();

			return json({
				success: true,

				data: {
					reaction: null
				}
			});
		} catch (err) {
			return error(500, {
				error: true,
				message: 'An error has occurred',
				details: err.message
			});
		}
	} else {
		try {
			await db('post_reactions')
				.insert({
					user_id: locals.user.id,
					post_id: params.post,
					reaction_id: data.reaction
				})
				.onConflict()
				.merge({
					reaction_id: data.reaction
				});

			return json({
				success: true,

				data: {
					reaction: data.reaction
				}
			});
		} catch (err) {
			return error(500, {
				error: true,
				message: 'An error has occurred',
				details: err.message
			});
		}
	}
}
