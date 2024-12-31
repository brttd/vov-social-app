import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';

function formatUser(data) {
	return {
		id: data.id,
		username: data.username
	};
}

export async function GET({ params, url }) {
	const query = db('users');

	if (url.searchParams.get('lookup') === 'username') {
		query.where({ username: params.user });
	} else {
		query.where({ id: params.user });
	}

	const data = await query.first('id', 'username');

	if (data) {
		return json({
			data: formatUser(data)
		});
	}

	return error(404, {
		error: true,
		message: 'User not found'
	});
}
