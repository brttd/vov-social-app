import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

function formatUser(data) {
	return {
		id: data.id,
		username: data.username
	};
}

export async function GET({ locals }) {
	const query = db('users').orderBy('username', 'desc');

	if (locals.user) {
		query.whereNot({ id: locals.user.id });
	}

	const data = await query.select('id', 'username');

	return json({
		start: 0,
		length: data.length,
		total: data.length,

		data: data.map(formatUser)
	});
}
