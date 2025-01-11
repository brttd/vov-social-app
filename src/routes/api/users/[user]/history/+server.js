import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function GET({ locals, params, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You must be logged in before seeing history'
		});
	}
	const data = await db('user_history')
		.where({
			'user_history.user_id': params.user
		})
		.whereNotNull('user_history.username')
		.orderBy('created_at', 'desc')
		.select(['username', 'created_at']);

	return json({
		data: data.map((entry) => {
			return {
				username: entry.username,
				created_at: entry.created_at
			};
		})
	});
}
